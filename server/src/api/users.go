package api

import (
	"database/sql"
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/florian-glombik/workplace-reservation/src/token"
	"github.com/florian-glombik/workplace-reservation/src/util"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"net/http"
	"time"
)

// User Roles

const Admin = "admin"
const StaticReservationPlanner = "static-reservation-planner"
const User = "user"

const ErrRequestCouldNotBeParsed = "The request could not be parsed."
const UnexpectedErrContactMessage = "An unexpected error has occurred. Please contact CONTACT_PERSON to contribute in resolving the problem as soon as possible."

const DuplicateKeyValueViolatesUniqueConstraint = "23505"

type CreateUserRequest struct {
	Username string `json:"username" binding:"omitempty"`
	Password string `json:"password" binding:"required,min=3"`
	Email    string `json:"email" binding:"required,email"`
}

type userWithoutHashedPassword struct {
	ID       uuid.UUID      `json:"id"`
	Email    string         `json:"email"`
	Username sql.NullString `json:"username"`
}

func getUserResponse(user db.User) userWithoutHashedPassword {
	return userWithoutHashedPassword{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
	}
}

// ShowAccount
// @Summary      Create a new account
// @Tags         accounts
// @Accept       json
// @Produce      json
// @Param        email   	path      string  true	 "TODO"
// @Param        password   path      string  true 	 "TODO"
// @Param        username   path      string  false  "TODO"
// @Param        firstName  path      string  false  "TODO"
// @Param        lastName   path      string  false  "TODO"
// @Description  get string by ID
// @Router       /users [post]
func (server *Server) createUser(context *gin.Context) {
	var request CreateUserRequest

	if err := context.ShouldBindJSON(&request); err != nil {
		validationErr := err.(validator.ValidationErrors)

		invalidInputTag := validationErr[0].Tag()
		if invalidInputTag == "email" {
			context.JSON(http.StatusBadRequest, errorResponse("Invalid E-Mail Address! Make sure to follow the format 'example@example.com' - include a '.' after the '@'", err))
			return
		}

		context.JSON(http.StatusBadRequest, errorResponse(ErrRequestCouldNotBeParsed+" Consider changing the input for "+invalidInputTag, err))
		return
	}

	hashedPassword, err := util.HashPassword(request.Password)
	if err != nil {
		context.JSON(http.StatusInternalServerError, "Problems occurred on saving the user credential.")
		return
	}

	//TODO how to insert null in database?
	createUserSqlParams := db.CreateUserParams{
		ID:       uuid.New(),
		Username: sql.NullString{String: request.Username, Valid: true},
		Password: hashedPassword,
		Email:    request.Email,
	}

	newUser, err := server.queries.CreateUser(context, createUserSqlParams)

	if err != nil {
		pqErr := err.(*pq.Error)

		if pqErr.Code == DuplicateKeyValueViolatesUniqueConstraint {
			context.JSON(http.StatusForbidden, errorResponse("E-Mail is already in use!", err))
			return
		}

		context.JSON(http.StatusInternalServerError, errorResponse("The user could not be created.", err))
		return
	}

	response := getUserResponse(newUser)
	context.JSON(http.StatusOK, response)
}

type GetUserByIdRequest struct {
	UserId uuid.UUID `json:"userId" binding:"required"`
}

// getUserById
// @Summary      Get user information by id if logged in
// @Tags         accounts
// @Router       /users [get]
func (server *Server) getUserById(context *gin.Context) {
	var request GetUserByIdRequest

	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse(ErrRequestCouldNotBeParsed, err))
		return
	}

	getUserByIdSqlParams := request.UserId

	user, err := server.queries.GetUserById(context, getUserByIdSqlParams)
	if err != nil {
		if err == sql.ErrNoRows {
			context.JSON(http.StatusNotFound, errorResponse("User not found!", err))
			return
		}

		context.JSON(http.StatusInternalServerError, errorResponse("Retrieving the user was not successful.", err))
		return
	}

	context.JSON(http.StatusOK, getUserResponse(user))
}

type loginUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=3"`
}

type loginUserResponse struct {
	AccessToken string                    `json:"accessToken"`
	User        userWithoutHashedPassword `json:"user"`
}

// ShowAccount
// @Summary      Login with existing user
// @Tags         accounts
// @Router       /users/login [post]
func (server *Server) loginUser(context *gin.Context) {
	var request loginUserRequest
	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse(ErrRequestCouldNotBeParsed, err))
		return
	}

	user, err := server.queries.GetUserByMail(context, request.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			context.JSON(http.StatusNotFound, errorResponse("There is no user with the entered E-Mail.", err))
			return
		}
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	err = util.CheckPassword(user.Password, request.Password)
	if err != nil {
		context.JSON(http.StatusUnauthorized, errorResponse("Login was not successful, make sure to double check the E-Mail and password!", err))
		return
	}

	accessToken, err := server.tokenGenerator.CreateToken(user.ID, time.Minute*60)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse("The access token could not be generated.", err))
		return
	}

	response := loginUserResponse{
		AccessToken: accessToken,
		User:        getUserResponse(user),
	}

	context.JSON(http.StatusOK, response)
}

type editUserRequest struct {
	ID        uuid.UUID `json:"id" binding:"required"`
	Email     string    `json:"email" binding:"required,email"`
	Username  string    `json:"username" binding:"omitempty"`
	FirstName string    `json:"firstName" binding:"omitempty,alphanum"`
	LastName  string    `json:"lastName" binding:"omitempty,alphanum"`
	Password  string    `json:"password" binding:"omitempty,min=3"`
}

// EditUser
// @Summary
// @Tags         accounts
// @Router       /users/edit [patch]
func (server *Server) editUser(context *gin.Context) {
	var request editUserRequest
	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse(ErrRequestCouldNotBeParsed, err))
		return
	}

	userToBeUpdated, err := server.queries.GetUserById(context, request.ID)
	authPayload := context.MustGet(authorizationPayloadKey).(*token.Payload)
	accountOfOtherUser := userToBeUpdated.ID != authPayload.UserId
	if accountOfOtherUser {
		context.JSON(http.StatusForbidden, errorResponse("You cannot update accounts of other users!", err))
		return
	}

	updateUserSqlParams := db.UpdateUserParams{
		ID:       request.ID,
		Username: sql.NullString{String: request.Username, Valid: true},
		Email:    request.Email,
		Password: userToBeUpdated.Password,
	}
	err = server.queries.UpdateUser(context, updateUserSqlParams)
	if err != nil {
		pqErr := err.(*pq.Error)

		if pqErr.Code == DuplicateKeyValueViolatesUniqueConstraint {
			context.JSON(http.StatusForbidden, errorResponse("E-Mail is already in use!", err))
			return
		}

		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	updatedUser, err := server.queries.GetUserById(context, request.ID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse(UnexpectedErrContactMessage, err))
		return
	}

	context.JSON(http.StatusOK, getUserResponse(updatedUser))
}

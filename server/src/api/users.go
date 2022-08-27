package api

import (
	"database/sql"
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/florian-glombik/workplace-reservation/src/util"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"net/http"
	"time"
)

type CreateUserRequest struct {
	Username  string `json:"username" binding:"omitempty,alphanum"`
	FirstName string `json:"firstName" binding:"omitempty,alphanum"`
	LastName  string `json:"lastName" binding:"omitempty,alphanum"`
	Password  string `json:"password" binding:"required,min=3"`
	Email     string `json:"email" binding:"required,email"`
}

type userWithoutHashedPassword struct {
	ID        string
	FirstName sql.NullString
	LastName  sql.NullString
	Email     string
}

func getUserResponse(user db.User) userWithoutHashedPassword {
	return userWithoutHashedPassword{
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Email:     user.Email,
	}
}

func (server *Server) createUser(context *gin.Context) {
	var request CreateUserRequest

	if err := context.ShouldBindJSON(&request); err != nil {
		validationErr := err.(validator.ValidationErrors)

		invalidInputTag := validationErr[0].Tag()
		if invalidInputTag == "email" {
			context.JSON(http.StatusBadRequest, errorResponse("Invalid E-Mail Address! Make sure to follow the format 'example@example.com' - include a '.' after the '@'", err))
			return
		}

		context.JSON(http.StatusBadRequest, errorResponse("The request could not be parsed.", err))
		return
	}

	hashedPassword, err := util.HashPassword(request.Password)
	if err != nil {
		context.JSON(http.StatusInternalServerError, "Problems occurred on saving the user credential.")
		return
	}

	// TODO how to insert null in database?
	arg := db.CreateUserParams{
		ID:        uuid.New(),
		Username:  sql.NullString{String: request.Username, Valid: true},
		FirstName: sql.NullString{String: request.FirstName, Valid: true},
		LastName:  sql.NullString{String: request.LastName, Valid: true},
		Password:  hashedPassword,
		Email:     request.Email,
	}

	newUser, err := server.queries.CreateUser(context, arg)

	if err != nil {
		pqErr := err.(*pq.Error)

		if pqErr.Code == pq.ErrorCode("23505") {
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

func (server *Server) getUserById(context *gin.Context) {
	var request GetUserByIdRequest

	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse("The request could not be parsed.", err))
		return
	}

	arg := request.UserId

	user, err := server.queries.GetUserById(context, arg)
	if err != nil {
		if err == sql.ErrNoRows {
			context.JSON(http.StatusNotFound, errorResponse("error: ", err))
			return
		}

		context.JSON(http.StatusInternalServerError, errorResponse("error: ", err))
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
	User        userWithoutHashedPassword `json:"userWithoutHashedPassword"`
}

func (server *Server) loginUser(context *gin.Context) {
	var request loginUserRequest
	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse("error: ", err))
		return
	}

	user, err := server.queries.GetUserByMail(context, request.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			context.JSON(http.StatusNotFound, errorResponse("error: ", err))
			return
		}
		context.JSON(http.StatusInternalServerError, errorResponse("error: ", err))
		return
	}

	err = util.CheckPassword(user.Password, request.Password)
	if err != nil {
		context.JSON(http.StatusUnauthorized, errorResponse("error: ", err))
		return
	}

	accessToken, err := server.tokenGenerator.CreateToken(user.ID, time.Minute*60)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse("error: ", err))
		return
	}

	response := loginUserResponse{
		AccessToken: accessToken,
		User:        getUserResponse(user),
	}

	context.JSON(http.StatusOK, response)
}

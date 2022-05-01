package api

import (
	"database/sql"
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/florian-glombik/workplace-reservation/src/util"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
	"time"
)

type CreateUserRequest struct {
	Username  string `json:"username" binding:"alphanum"`
	FirstName string `json:"firstName" binding:"alphanum"`
	LastName  string `json:"lastName" binding:"alphanum"`
	Password  string `json:"password" binding:"required,min=3"`
	Email     string `json:"email" binding:"required,email"`
}

// CreateUserResponse does not return the hashed password
type userResponse struct {
	ID        string
	FirstName sql.NullString
	LastName  sql.NullString
	Email     string
}

// sensible information (such as the hashed password) shall not be sent to the client
func getUserResponse(user db.User) userResponse {
	return userResponse{
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Email:     user.Email,
	}
}

func (server *Server) createUser(context *gin.Context) {
	var request CreateUserRequest

	if err := context.ShouldBindJSON(&request); err != nil {
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
	AccessToken string       `json:"accessToken"`
	User        userResponse `json:"userResponse"`
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

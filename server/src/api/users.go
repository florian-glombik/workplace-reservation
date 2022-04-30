package api

import (
	"database/sql"
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/florian-glombik/workplace-reservation/src/util"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
)

type CreateUserRequest struct {
	FirstName string `json:"firstName" binding:"alphanum"`
	LastName  string `json:"lastName" binding:"alphanum"`
	Password  string `json:"password" binding:"required,min=3"`
	Email     string `json:"email" binding:"required,email"`
}

// CreateUserResponse does not return the hashed password
type CreateUserResponse struct {
	ID        string
	FirstName sql.NullString
	LastName  sql.NullString
	Email     string
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

	arg := db.CreateUserParams{
		ID:        uuid.NewString(),
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

	response := CreateUserResponse{
		ID:        newUser.ID,
		FirstName: newUser.FirstName,
		LastName:  newUser.LastName,
		Email:     newUser.Email,
	}
	context.JSON(http.StatusOK, response)
}

type GetUserRequest struct {
	UserId string `json:"userId" binding:"required"`
}

func (server *Server) getUser(context *gin.Context) {
	var request GetUserRequest

	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse("The request could not be parsed.", err))
		return
	}

	arg := request.UserId

	account, err := server.queries.GetUser(context, arg)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse("The user could not be created.", err))
		return
	}

	context.JSON(http.StatusOK, account)
}

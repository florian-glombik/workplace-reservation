package api

import (
	"database/sql"
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
)

type CreateAccountRequest struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Password  string `json:"password" binding:"required"`
	Email     string `json:"email" binding:"required"`
}

func (server *Server) createUser(context *gin.Context) {
	var request CreateAccountRequest

	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse("The request could not be parsed.", err))
		return
	}

	arg := db.CreateUserParams{
		ID:        uuid.NewString(),
		FirstName: sql.NullString{String: request.FirstName, Valid: true},
		LastName:  sql.NullString{String: request.LastName, Valid: true},
		Password:  request.Password,
		Email:     request.Email,
	}

	account, err := server.queries.CreateUser(context, arg)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse("The user could not be created.", err))
		return
	}

	context.JSON(http.StatusOK, account)
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

package api

import (
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/gin-gonic/gin"
	"net/http"
)

type CreateAccountRequest struct {
	User_Id  int32  `json:"user_Id" binding:"required"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email" binding:"required"`
}

func (server *Server) createAccount(context *gin.Context) {
	var request CreateAccountRequest

	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, errorResponse("The request could not be parsed.", err))
		return
	}

	arg := db.CreateUserParams{
		UserID:   request.User_Id,
		Username: request.Username,
		Password: request.Password,
		Email:    request.Email,
	}

	account, err := server.queries.CreateUser(context, arg)
	if err != nil {
		context.JSON(http.StatusInternalServerError, errorResponse("The user could not be created.", err))
		return
	}

	context.JSON(http.StatusOK, account)
}

package api

import (
	"database/sql"
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/gin-gonic/gin"
)

type Server struct {
	database *sql.DB
	queries  *db.Queries
	router   *gin.Engine
}

func NewServer(database *sql.DB) *Server {
	server := &Server{database: database, queries: db.New(database)}
	router := gin.Default()

	router.POST("/users", server.createUser)
	router.GET("/users", server.getUser)

	server.router = router
	return server
}

func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

func errorResponse(description string, err error) gin.H {
	return gin.H{description: err.Error()}
}

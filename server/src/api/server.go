package api

import (
	"database/sql"
	"fmt"
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/florian-glombik/workplace-reservation/src/token"
	"github.com/gin-gonic/gin"
)

type Server struct {
	database       *sql.DB
	queries        *db.Queries
	tokenGenerator token.Generator
	router         *gin.Engine
}

func NewServer(database *sql.DB) *Server {
	// TODO load secret key from config file
	tokenGenerator, err := token.NewJWTGenerator("dlgdjflgjsadfjlsjdfljsldjflsjddflkgj")
	// TODO improve logging
	if err != nil {
		//fmt.Errorf("cannot instantiate token generator: %w", err)
		fmt.Println("cannot instantiate token generator: %w", err)
		return nil
	}

	server := &Server{
		database:       database,
		queries:        db.New(database),
		tokenGenerator: tokenGenerator,
	}

	server.setupRouter()
	return server
}

func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

func (server *Server) setupRouter() {
	router := gin.Default()

	router.POST("/users", server.createUser)
	router.POST("/users/login", server.loginUser)

	router.GET("/users", server.getUserById)

	server.router = router
}

func errorResponse(description string, err error) gin.H {
	return gin.H{description: err.Error()}
}

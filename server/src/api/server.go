package api

import (
	"database/sql"
	"errors"
	"fmt"
	db "github.com/florian-glombik/workplace-reservation/db/sqlc"
	"github.com/florian-glombik/workplace-reservation/src/token"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"net/http"
	"strings"
)

const (
	authorizationHeaderKey  = "authorization"
	authorizationTypeBearer = "bearer"
	authorizationPayloadKey = "authorization_payload"
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

	corsConfig := cors.DefaultConfig()

	ClientAddress := "http://localhost:3000"

	// TODO move client address to config file
	corsConfig.AllowOrigins = []string{ClientAddress}
	// To be able to send tokens to the server.
	corsConfig.AllowCredentials = true
	// OPTIONS method for ReactJS
	corsConfig.AddAllowMethods("OPTIONS, GET")
	corsConfig.AddAllowHeaders("Access-Control-Allow-Headers", "*")
	// Register the middleware
	router.Use(cors.New(corsConfig))

	router.POST("/users", server.createUser)
	router.POST("/users/login", server.loginUser)

	authRoutes := router.Group("/").Use(authenticate(server.tokenGenerator))

	authRoutes.PATCH("/users/edit", server.editUser)
	authRoutes.GET("/workplaces", server.getWorkplaces)
	authRoutes.GET("/workplaces/names", server.getNamesOfWorkplaces)
	authRoutes.POST("/workplace/create", server.createWorkplace)
	authRoutes.POST("/workplace/reserve", server.handleCreateReservation)
	authRoutes.DELETE("/workplace/reservations/:reservation-id", server.deleteReservation)
	authRoutes.GET("/workplace/reservations", server.getReservations)
	authRoutes.POST("/reservations/reoccurring", server.addReoccurringReservation)
	authRoutes.GET("/users", server.getUserById)

	router.GET("swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	server.router = router
}

func authenticate(tokenGenerator token.Generator) gin.HandlerFunc {
	return func(context *gin.Context) {
		authorizationHeader := context.GetHeader(authorizationHeaderKey)

		if len(authorizationHeader) == 0 {
			err := errors.New("authorization header is not provided")
			context.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err.Error(), err))
			return
		}

		fields := strings.Fields(authorizationHeader)
		if len(fields) != 2 {
			err := errors.New("invalid authorization header format")
			context.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err.Error(), err))
			return
		}

		authorizationType := strings.ToLower(fields[0])
		if authorizationType != authorizationTypeBearer {
			err := fmt.Errorf("unsupported authorization type %s", authorizationType)
			context.AbortWithStatusJSON(http.StatusUnauthorized, errorResponse(err.Error(), err))
			return
		}

		accessToken := fields[1]
		payload, err := tokenGenerator.VerifyToken(accessToken)
		if err != nil {
			// the error shall not be shown to the user as it would leak which part of the decoded token is invalid
			context.AbortWithStatusJSON(http.StatusUnauthorized, "Invalid token")
			return
		}

		context.Set(authorizationPayloadKey, payload)
		context.Next()
	}

}

func errorResponse(description string, err error) gin.H {
	return gin.H{"message": description, "reason": err.Error()}
}

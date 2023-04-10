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
	"log"
	"net/http"
	"os"
	"strings"
)

const (
	authorizationHeaderKey        = "authorization"
	authorizationTypeBearer       = "bearer"
	authorizationPayloadKey       = "authorization_payload"
	EnvJwtTokenGeneratorSecretKey = "JWT_TOKEN_GENERATOR_SECRET_KEY"
	EnvCertFilePath               = "CERT_FILE_PATH"
	EnvCertKeyPath                = "CERT_KEY_PATH"
)

type Server struct {
	database       *sql.DB
	queries        *db.Queries
	tokenGenerator token.Generator
	router         *gin.Engine
}

func NewServer(database *sql.DB) *Server {
	JwtTokenGeneratorSecretKey, isSet := os.LookupEnv(EnvJwtTokenGeneratorSecretKey)
	if !isSet {
		errorString, _ := fmt.Printf("Environment variable is not set: %d", EnvJwtTokenGeneratorSecretKey)
		panic(errorString)
	}
	tokenGenerator, err := token.NewJWTGenerator(JwtTokenGeneratorSecretKey)
	if err != nil {
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
	log.Println("starting server ...")

	certFilePath, certFileIsSet := os.LookupEnv(EnvCertFilePath)
	certKeyPath, certKeyIsSet := os.LookupEnv(EnvCertKeyPath)

	log.Println("\t certFilePath: &d", certFilePath)
	log.Println("\t certKeyPath: &d", certKeyPath)

	if certFileIsSet && certKeyIsSet {
		return server.router.RunTLS(":8080", certFilePath, certKeyPath)
	} else {
		log.Println("\t starting server without TLS due to unset certFile/certKey path")
		return server.router.Run(address)
	}
}

func (server *Server) setupRouter() {
	router := gin.Default()

	//err := router.SetTrustedProxies(nil)
	//if err != nil {
	//	log.Fatal(err.Error())
	//}

	corsConfig := cors.DefaultConfig()

	ClientAddress := "http://0.0.0.0:80"

	// TODO move client address to config file
	corsConfig.AllowOrigins = []string{ClientAddress, "https://0.0.0.0:80", "http://0.0.0.0:3000", "https://0.0.0.0:3000", "http://localhost:3000", "http://localhost:3000", "*"}
	// To be able to send tokens to the server.
	corsConfig.AllowCredentials = true
	// OPTIONS method for ReactJS
	corsConfig.AddAllowMethods("OPTIONS, GET, POST")
	corsConfig.AddAllowHeaders("Access-Control-Allow-Headers", "*")
	// Register the middleware
	router.Use(cors.New(corsConfig))

	router.POST("/users", server.createUser)
	router.POST("/users/login", server.loginUser)

	authRoutes := router.Group("/").Use(authenticate(server.tokenGenerator))

	authRoutes.PATCH("/users/edit", server.editUser)
	authRoutes.GET("/users/all-available", server.loadAvailableUsers)
	authRoutes.GET("/users", server.getUserById)

	authRoutes.GET("/workplaces", server.getWorkplaces)
	authRoutes.GET("/workplaces/names", server.getNamesOfWorkplaces)
	authRoutes.POST("/workplaces", server.createWorkplace)
	authRoutes.PATCH("/workplaces/:workplaceId", server.editWorkplace)
	authRoutes.DELETE("/workplaces/:workplaceId", server.deleteWorkplace)

	authRoutes.POST("/workplace/reserve", server.handleCreateReservation)
	authRoutes.DELETE("/workplace/reservations/:reservation-id", server.handleDeleteReservation)

	authRoutes.GET("/reservations/recurring", server.getActiveRecurringReservations)
	authRoutes.GET("/reservations/recurring/all-users", server.getActiveRecurringReservationsOfAllUsers)
	authRoutes.POST("/reservations/recurring", server.addRecurringReservation)
	authRoutes.DELETE("/reservations/recurring/:recurring-reservation-id", server.deleteRecurringReservation)

	authRoutes.GET("/offices", server.getOffices)
	authRoutes.GET("/offices/:office-id", server.getOfficeById)
	authRoutes.POST("/offices", server.createOffice)
	authRoutes.PATCH("/offices/:office-id", server.editOffice)
	authRoutes.DELETE("/offices/:office-id", server.deleteOffice)

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

package main

import (
	"database/sql"
	"fmt"
	"github.com/florian-glombik/workplace-reservation/src/api"
	_ "github.com/florian-glombik/workplace-reservation/src/docs"
	_ "github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/github"
	_ "github.com/lib/pq"
	_ "github.com/swaggo/files"
	_ "github.com/swaggo/gin-swagger"
	"log"
	"os"
)

const (
	databaseDriver              = "postgres"
	serverAddress               = "0.0.0.0:8080"
	EnvDatabasePassword         = "POSTGRES_PASSWORD"
	EnvDatabaseUser             = "POSTGRES_USER"
	EnvIsDevelopmentEnvironment = "IS_DEVELOPMENT"
)

// @title           Workplace Reservation API
// @version         1.0

// @contact.name   API Support

// @host      0.0.0.0:8080
// @BasePath  /api/v1
func main() {
	databasePassword, isSet := os.LookupEnv(EnvDatabasePassword)
	databaseUser, isUserSet := os.LookupEnv(EnvDatabaseUser)
	isDevelopmentEnvironment, _ := os.LookupEnv(EnvIsDevelopmentEnvironment)
	if !isSet {
		log.Fatal(fmt.Sprintf("Environment variable '%s' is not defined", EnvDatabasePassword))
	}
	if !isUserSet {
		log.Fatal(fmt.Sprintf("Environment variable '%s' is not defined", EnvDatabaseUser))
	}

	databaseIp := ""
	if isDevelopmentEnvironment == "true" {
		databaseIp = "0.0.0.0"
	} else {
		databaseIp = "database"
	}

	databaseSource := fmt.Sprintf("postgresql://%s:%s@%s:5432/workplace_reservation?sslmode=disable", databaseUser, databasePassword, databaseIp)

	log.Println("opening database connection ...")
	databaseConnection, err := sql.Open(databaseDriver, databaseSource)
	if err != nil {
		log.Fatal("cannot open database connection:", err)
	}
	log.Println("opened and configured database connection")

	server := api.NewServer(databaseConnection)

	err = server.Start(serverAddress)
	if err != nil {
		log.Fatal("cannot start server:", err)
	}
	log.Println("server up and running")
}

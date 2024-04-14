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
	databaseDriver      = "postgres"
	serverAddress       = "0.0.0.0:8080"
	EnvDatabasePassword = "POSTGRES_PASSWORD"
	EnvDatabaseUser     = "POSTGRES_USER"
)

// @title           Workplace Reservation API
// @version         1.0

// @contact.name   API Support

// @host      0.0.0.0:8080
// @BasePath  /api/v1
func main() {
	databasePassword, isSet := os.LookupEnv(EnvDatabasePassword)
	databaseUser, isUserSet := os.LookupEnv(EnvDatabaseUser)
	if !isSet {
		log.Fatal(fmt.Sprintf("Environment variable '%s' is not defined", EnvDatabasePassword))
	}
	if !isUserSet {
		log.Fatal(fmt.Sprintf("Environment variable '%s' is not defined", EnvDatabaseUser))
	}
	// database is not found with 0.0.0.0 on VM
	databaseSource := fmt.Sprintf("postgresql://%s:%s@database:5432/workplace_reservation?sslmode=disable", databaseUser, databasePassword)
	//databaseSource := fmt.Sprintf("postgresql://%s:%s@0.0.0.0:5432/workplace_reservation?sslmode=disable", databaseUser, databasePassword)

	log.Println("attempting to open database connection ...")
	databaseConnection, err := sql.Open(databaseDriver, databaseSource)
	if err != nil {
		log.Fatal("cannot establish database connection:", err)
	}
	log.Println("established connection to database")

	server := api.NewServer(databaseConnection)

	err = server.Start(serverAddress)
	if err != nil {
		log.Fatal("cannot start server:", err)
	}
	log.Println("server up and running")
}

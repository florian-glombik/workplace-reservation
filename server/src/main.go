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
	EnvDatabasePassword = "DB_ROOT_PASSWORD"
)

// @title           Workplace Reservation API
// @version         1.0

// @contact.name   API Support

// @host      localhost:8080
// @BasePath  /api/v1
func main() {
	databasePassword, isSet := os.LookupEnv(EnvDatabasePassword)
	if !isSet {
		log.Fatal(fmt.Sprintf("Environment variable '%s' is not defined", EnvDatabasePassword))
	}
	databaseSource := fmt.Sprintf("postgresql://root:%s@database:5432/workplace_reservation?sslmode=disable", databasePassword)

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

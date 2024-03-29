package main

import (
	"database/sql"
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
)

const (
	databaseDriver = "postgres"
	databaseSource = "postgresql://root:root@localhost:5432/workplace_reservation?sslmode=disable"
	serverAddress  = "0.0.0.0:8080"
)

// @title           Workplace Reservation API
// @version         1.0

// @contact.name   API Support

// @host      localhost:8080
// @BasePath  /api/v1
func main() {

	databaseConnection, err := sql.Open(databaseDriver, databaseSource)
	if err != nil {
		log.Fatal("cannot establish database connection:", err)
	}

	server := api.NewServer(databaseConnection)

	err = server.Start(serverAddress)
	if err != nil {
		log.Fatal("cannot start server:", err)
	}
}

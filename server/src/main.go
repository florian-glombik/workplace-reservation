package main

import (
	"database/sql"
	"github.com/florian-glombik/workplace-reservation/src/api"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/github"
	_ "github.com/lib/pq"
	"log"
)

const (
	databaseDriver = "postgres"
	databaseSource = "postgresql://root:root@localhost:5432/workplace_reservation?sslmode=disable"
	serverAddress  = "0.0.0.0:8080"
)

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

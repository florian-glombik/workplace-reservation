package main

import (
	_ "github.com/go-sql-driver/mysql"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/github"
	"log"
)

func main() {

	m, err := migrate.New(
		"file://db/migrations",
		"postgres://postgres:postgres@localhost:5432/example?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}
	if err := m.Up(); err != nil {
		log.Fatal(err)
	}

	//db, err := sql.Open("postgres", "postgres://localhost:5432/database?sslmode=enable")
	//if err != nil {
	//	fmt.Println("error validating sql.Open arguments")
	//	panic(err.Error())
	//}
	//driver, err := postgres.WithInstance(db, &postgres.Config{})
	//m, err := migrate.NewWithDatabaseInstance(
	//	"file:///migrations",
	//	"postgres", driver)
	//m.Up() // or m.Step(2) if you want to explicitly set the number of migrations to run

	//db, err := sql.Open("mysql", "root:eist@tcp(localhost:3306)/workplacereservation")
	//if err != nil {
	//	fmt.Println("error validating sql.Open arguments")
	//	panic(err.Error())
	//}
	//defer db.Close()
	//
	//err = db.Ping()
	//if err != nil {
	//	fmt.Println("error verifying connection with db.Ping")
	//	panic(err.Error())
	//}
	//
	//fmt.Println("Successful connection to database")
	//
	//insert, err := db.Query("INSERT INTO `workplaceReservation`.`students` (`id`, `firstname`, `lastname`) VALUES ('2', 'Ben', 'Ford');")
	//if err != nil {
	//	panic(err.Error())
	//}
	//defer insert.Close()
	//
	//srv := api.NewServer()
	//err = http.ListenAndServe(":8080", srv)
	//if err != nil {
	//	panic(err.Error())
	//}

	//http.HandleFunc("/", func(responseWriter http.ResponseWriter, response *http.Request) {
	//	responseWriter.Write([]byte("hello world 1111" + uuid.NewString()))
	//})
	//http.ListenAndServe(":8080", nil)
}

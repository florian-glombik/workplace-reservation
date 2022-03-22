package main

import (
	"database/sql"
	"fmt"
	"github.com/florian-glombik/workplace-reservation/src/api"
	_ "github.com/go-sql-driver/mysql"
	"net/http"
)

func main() {

	db, err := sql.Open("mysql", "root:eist@tcp(localhost:3306)/workplacereservation")
	if err != nil {
		fmt.Println("error validating sql.Open arguments")
		panic(err.Error())
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		fmt.Println("error verifying connection with db.Ping")
		panic(err.Error())
	}

	fmt.Println("Successful connection to database")

	insert, err := db.Query("INSERT INTO `workplaceReservation`.`students` (`id`, `firstname`, `lastname`) VALUES ('2', 'Ben', 'Ford');")
	if err != nil {
		panic(err.Error())
	}
	defer insert.Close()

	srv := api.NewServer()
	err = http.ListenAndServe(":8080", srv)
	if err != nil {
		panic(err.Error())
	}
	//http.HandleFunc("/", func(responseWriter http.ResponseWriter, response *http.Request) {
	//	responseWriter.Write([]byte("hello world 1111" + uuid.NewString()))
	//})
	//http.ListenAndServe(":8080", nil)
}

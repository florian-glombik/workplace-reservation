package main

import (
	"github.com/florian-glombik/workplace-reservation/src/api"
	"net/http"
)

func main() {
	srv := api.NewServer()
	http.ListenAndServe(":8080", srv)
	//http.HandleFunc("/", func(responseWriter http.ResponseWriter, response *http.Request) {
	//	responseWriter.Write([]byte("hello world 1111" + uuid.NewString()))
	//})
	//http.ListenAndServe(":8080", nil)
}

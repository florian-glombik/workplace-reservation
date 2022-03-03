package main

import (
	"net/http"
)

func main() {
	http.HandleFunc("/", func(responseWriter http.ResponseWriter, response *http.Request) {
		responseWriter.Write([]byte("hello world 1111"))
	})
	http.ListenAndServe(":8080", nil)
}

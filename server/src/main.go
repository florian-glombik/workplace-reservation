package main

import (
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// We'll need to define an Upgrader
// this will require a Read and Write buffer size
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,

	// We'll need to check the origin of our connection
	// this will allow us to make requests from our React
	// development server to here.
	// For now, we'll do no checking and just allow any connection
	CheckOrigin: func(r *http.Request) bool { return true },
}

// define a reader which will listen for
// new messages being sent to our WebSocket
// endpoint
func reader(conn *websocket.Conn) {
	for {
		// read in a message
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		// print out that message for clarity
		fmt.Println(string(p))

		if err := conn.WriteMessage(messageType, p); err != nil {
			log.Println(err)
			return
		}

	}
}

// define our WebSocket endpoint
func serveWs(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.Host)

	// upgrade this connection to a WebSocket
	// connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}
	// listen indefinitely for new messages coming
	// through on our WebSocket connection
	reader(ws)
}

func setupRoutes() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Simple Server")
	})
	// map our `/ws` endpoint to the `serveWs` function
	http.HandleFunc("/ws", serveWs)
}

func main() {
	fmt.Println("Chat App v0.01")
	setupRoutes()
	http.ListenAndServe(":8080", nil)

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
	//srv := api2.NewServer()
	//err = http.ListenAndServe(":8081", srv)
	//if err != nil {
	//	panic(err.Error())
	//}

	//http.HandleFunc("/", func(responseWriter http.ResponseWriter, response *http.Request) {
	//	responseWriter.Write([]byte("hello world 1111" + uuid.NewString()))
	//})
	//http.ListenAndServe(":8080", nil)
}

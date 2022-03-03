package api

import (
	"github.com/google/uuid"
)

type Item struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

//type Server struct {
//	*mux.Router
//
//	shoppingItems []Item
//}

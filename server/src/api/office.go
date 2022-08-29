package api

import (
	"database/sql"
	"github.com/google/uuid"
)

type Office struct {
	ID          uuid.UUID      `json:"id"`
	Name        sql.NullString `json:"name"`
	Description sql.NullString `json:"description"`
}

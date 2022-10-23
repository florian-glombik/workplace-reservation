package token

import (
	"github.com/google/uuid"
	"time"
)

type Generator interface {
	CreateToken(userId uuid.UUID, duration time.Duration, role string) (string, error)

	VerifyToken(token string) (*Payload, error)
}

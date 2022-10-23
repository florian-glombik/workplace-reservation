package token

import (
	"fmt"
	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
	"time"
)

const MinSecretKeySize = 32

type JWTMaker struct {
	secretKey string
}

func NewJWTGenerator(secretKey string) (Generator, error) {
	if len(secretKey) < MinSecretKeySize {
		return nil, fmt.Errorf("invalid key size: must be at least %d characters but was %d", MinSecretKeySize, len(secretKey))
	}
	return &JWTMaker{secretKey}, nil
}

func (maker *JWTMaker) CreateToken(userId uuid.UUID, duration time.Duration, role string) (string, error) {
	payload, err := NewPayload(userId, duration, role)
	if err != nil {
		return "", err
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)
	return jwtToken.SignedString([]byte(maker.secretKey))
}

func (maker *JWTMaker) VerifyToken(token string) (*Payload, error) {
	keyFunc := func(token *jwt.Token) (interface{}, error) {
		_, ok := token.Method.(*jwt.SigningMethodHMAC)
		if !ok {
			return nil, ErrInvalidToken
		}
		return []byte(maker.secretKey), nil
	}

	jwtToken, err := jwt.ParseWithClaims(token, &Payload{}, keyFunc)
	if err != nil {
		return nil, err
	}

	payload, ok := jwtToken.Claims.(*Payload)
	if !ok {
		return nil, ErrInvalidToken
	}

	return payload, nil
}

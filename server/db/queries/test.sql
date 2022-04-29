-- name: CreateUser :one
INSERT INTO users (user_Id, username, password, email)
VALUES ($1, $2, $3, $4) RETURNING *;
-- name: CreateUser :one
INSERT INTO users (id, first_name, last_name, password, email)
VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- name: GetUser :one
SELECT * FROM users
WHERE id = $1;
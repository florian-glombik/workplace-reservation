-- name: CreateUser :one
INSERT INTO users (id, username, first_name, last_name, password, email)
VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;

-- name: GetUserByMail :one
SELECT * FROM users
WHERE email = $1;

-- name: GetUserById :one
SELECT * FROM users
WHERE id = $1;

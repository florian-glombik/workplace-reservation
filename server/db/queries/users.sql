-- name: CreateUser :one
INSERT INTO users (id, username, first_name, last_name, password, email)
VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;

-- name: GetUserByMail :one
SELECT * FROM users
WHERE email = $1;

-- name: GetUserById :one
SELECT * FROM users
WHERE id = $1;

-- name: UpdateUser :exec
UPDATE users
SET username=$2, email=$3, first_name=$4, last_name=$5, password=$6
WHERE id=$1;
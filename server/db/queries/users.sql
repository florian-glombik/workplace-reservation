-- name: CreateUser :one
INSERT INTO users (id, username, password, email)
VALUES ($1, $2, $3, $4) RETURNING *;

-- name: GetUserByMail :one
SELECT * FROM users
WHERE email = $1;

-- name: GetUserById :one
SELECT * FROM users
WHERE id = $1;

-- name: UpdateUser :exec
UPDATE users
SET username=$2, email=$3, password=$4
WHERE id=$1;
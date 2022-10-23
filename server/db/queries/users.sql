-- name: CreateUser :one
INSERT INTO users (id, username, password, email, role)
VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- name: GetUserByMail :one
SELECT *
FROM users
WHERE email = $1;

-- name: GetUserById :one
SELECT *
FROM users
WHERE id = $1;

-- name: UpdateUser :exec
UPDATE users
SET username=$2, email=$3, password=$4, role=$5
WHERE id=$1;

-- name: GetUserRoleById :one
SELECT role
FROM users
WHERE id = $1;

-- name: GetAllUsers :many
SELECT *
FROM users;
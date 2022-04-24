-- name: createUser :one
INSERT INTO users (user_id, username, password, email)
VALUES ($1, $2, $3, $4)
RETURNING *;
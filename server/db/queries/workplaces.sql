-- name: CreateWorkplace :one
INSERT INTO workplaces (id, name, description, office_id)
VALUES ($1, $2, $3, $4) RETURNING *;

-- name: GetWorkplaceById :one
SELECT * FROM workplaces
WHERE id = $1;

-- name: GetAllWorkplaces :many
SELECT * FROM workplaces;

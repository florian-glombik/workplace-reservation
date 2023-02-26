-- name: GetOffices :many
SELECT *
FROM offices;

-- name: CreateOffices :one
INSERT INTO offices (id, name, description)
VALUES ($1, $2, $3) RETURNING *;

-- name: UpdateOffice :execresult
UPDATE offices
SET name = $2, description = $3
WHERE id = $1;

-- name: DeleteOffice :execresult
DELETE
FROM offices
WHERE id = $1;
-- name: GetOffices :many
SELECT *
FROM offices;

-- name: GetOfficeById :one
SELECT *
FROM offices
WHERE id = $1;

-- name: CreateOffices :one
INSERT INTO offices (id, name, description, location, location_url)
VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- name: UpdateOffice :execresult
UPDATE offices
SET name = $2, description = $3, location = $4, location_url = $5
WHERE id = $1;

-- name: DeleteOffice :execresult
DELETE
FROM offices
WHERE id = $1;
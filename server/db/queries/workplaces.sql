-- name: CreateWorkplace :one
INSERT INTO workplaces (id, name, description, office_id)
VALUES ($1, $2, $3, $4) RETURNING *;

-- name: GetWorkplaceById :one
SELECT *
FROM workplaces
WHERE id = $1;

-- name: GetWorkplaces :many
SELECT *
FROM workplaces;

-- name: UpdateWorkplace :execresult
UPDATE workplaces
SET name = $2, description = $3
WHERE id = $1;

-- name: GetWorkplacesByOfficeId :many
SELECT *
FROM workplaces
WHERE office_id = $1;

-- name: DeleteWorkplace :execresult
DELETE
FROM workplaces
WHERE id = $1;

-- name: GetNamesOfWorkplaces :many
SELECT workplaces.id, workplaces.name
FROM workplaces;

-- name: RetrieveWorkplaceReservationsInTimespan :many
SELECT reservationsInTimespan.*, users.username, users.email
FROM users
         RIGHT JOIN
     (SELECT *
      FROM reservations
      WHERE reserved_workplace_id = $1
        AND (
              start_date BETWEEN $2 AND $3
              OR end_date BETWEEN $2 AND $3
          )) AS reservationsInTimespan
     ON reservationsInTimespan.reserving_user_id = users.id;
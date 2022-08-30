-- name: CreateWorkplace :one
INSERT INTO workplaces (id, name, description, office_id)
VALUES ($1, $2, $3, $4) RETURNING *;

-- name: GetWorkplaceById :one
SELECT * FROM workplaces
WHERE id = $1;

-- name: GetWorkplaces :many
SELECT * FROM workplaces;

SELECT *
FROM reservations
WHERE
    reserved_workplace_id=$1
    AND(
        start_date BETWEEN $2 AND $3
        OR end_date BETWEEN $2 AND $3
    );

-- name: RetrieveWorkplaceReservationsInTimespan :many
SELECT reservationsInTimespan.*, users.username, users.email
FROM users
RIGHT JOIN
   (SELECT *
   FROM reservations
   WHERE
           reserved_workplace_id=$1
     AND(
           start_date BETWEEN $2 AND $3
           OR end_date BETWEEN $2 AND $3
       )) AS reservationsInTimespan
ON reservationsInTimespan.reserving_user_id = users.id;

-- name: ReserveWorkplace :one
INSERT INTO reservations (id, start_date, end_date, reserving_user_id, reserved_workplace_id)
VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- name: RetrieveReservationsInTimespan :many
SELECT *
FROM reservations
WHERE start_date BETWEEN $1 AND $2
    OR end_date BETWEEN $1 AND $2;

-- name: GetReservationById :one
SELECT *
FROM reservations
WHERE id=$1;

-- name: DeleteReservation :execresult
DELETE
FROM reservations
WHERE id=$1;

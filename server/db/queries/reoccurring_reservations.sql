-- name: CreateReoccurringReservation :one
INSERT INTO reoccurring_reservations (id, interval_in_days, repeated_reservation_id, repeat_until)
VALUES ($1, $2, $3, $4) RETURNING *;



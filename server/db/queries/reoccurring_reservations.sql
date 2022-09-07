-- name: CreateReoccurringReservation :one
INSERT INTO reoccurring_reservations (id, interval_in_days, repeated_reservation_id, repeat_until)
VALUES ($1, $2, $3, $4) RETURNING *;

-- name: ReoccurringReservationsInTimespan :many
SELECT reservation.*, reoccurring.*
FROM (SELECT *
      FROM reservations
      WHERE start_date <= $1) AS reservation
         INNER JOIN (SELECT *
                     FROM reoccurring_reservations
                     WHERE reoccurring_reservations.repeat_until >=
                           (SELECT TO_DATE($2, 'YYYY/MM/DD') - INTERVAL '1 day' * reoccurring_reservations.interval_in_days)) AS reoccurring
ON reoccurring.repeated_reservation_id = reservation.id;

-- name: ReoccurringReservationsOfWorkplaceInTimespan :many
SELECT reservation.*, reoccurring.*
FROM (SELECT *
      FROM reservations
      WHERE reserved_workplace_id = $1) AS reservation
         INNER JOIN (SELECT *
                     FROM reoccurring_reservations
                     WHERE reoccurring_reservations.repeat_until >=
                           (SELECT TO_DATE($2, 'YYYY/MM/DD') - INTERVAL '1 day' * reoccurring_reservations.interval_in_days)) AS reoccurring
ON reoccurring.repeated_reservation_id = reservation.id;
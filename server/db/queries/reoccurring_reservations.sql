-- name: CreateReoccurringReservation :one
INSERT INTO reoccurring_reservations (id, interval_in_days, repeated_reservation_id, repeat_until)
VALUES ($1, $2, $3, $4) RETURNING *;

-- name: RetrieveReoccurringReservationsInTimespan :many
SELECT reservation.id, reservation.start_date, reservation.end_date, reservation.reserving_user_id, reservation.reserved_workplace_id, reoccurring.id, reoccurring.interval_in_days, reoccurring.repeated_reservation_id, reoccurring.repeat_until
FROM (SELECT *
      FROM reservations
      WHERE start_date BETWEEN $1 AND $2
            OR end_date BETWEEN $1 AND $2) AS reservation
JOIN (SELECT *
      FROM reoccurring_reservations
      WHERE reoccurring_reservations.repeat_until BETWEEN $1 AND $2) AS reoccurring
ON reoccurring.repeated_reservation_id = reservation.id;

-- name: RetrieveReoccurringWorkplaceReservationsInTimespan :many
SELECT reservation.id, reservation.start_date, reservation.end_date, reservation.reserving_user_id, reservation.reserved_workplace_id, reoccurring.id, reoccurring.interval_in_days, reoccurring.repeated_reservation_id, reoccurring.repeat_until
FROM (SELECT *
      FROM reservations
      WHERE reserved_workplace_id=$1
        AND (start_date BETWEEN $2 AND $3
             OR end_date BETWEEN $2 AND $3)) AS reservation
INNER JOIN (SELECT *
      FROM reoccurring_reservations
      WHERE reoccurring_reservations.repeat_until BETWEEN $2 AND $3) AS reoccurring
ON reoccurring.repeated_reservation_id = reservation.id;

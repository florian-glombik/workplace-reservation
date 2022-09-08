-- name: CreateReoccurringReservation :one
INSERT INTO reoccurring_reservations (id, interval_in_days, repeated_reservation_id, repeat_until)
VALUES ($1, $2, $3, $4) RETURNING *;

-- name: ReoccurringReservationsOfUser :many
SELECT reoccurringReservationsWithStartDate.*, workplaces.name AS workplaceName
FROM
    (SELECT reoccurring_reservations.*, reservationsOfUser.start_date, reservationsOfUser.reserved_workplace_id
     FROM (SELECT *
           FROM reservations
           WHERE reservations.reserving_user_id = $1) AS reservationsOfUser
              JOIN reoccurring_reservations
                   ON reoccurring_reservations.repeated_reservation_id = reservationsOfUser.id) AS reoccurringReservationsWithStartDate
        JOIN workplaces
             ON workplaces.id = reoccurringReservationsWithStartDate.reserved_workplace_id;

-- name: GetReoccurringReservationByRepeatedReservationId :one
SELECT *
FROM reoccurring_reservations
WHERE repeated_reservation_id = $1;

-- name: CreateReoccurringReservationException :one
INSERT INTO reoccurring_reservations_exceptions (id, reoccurring_reservation_id, start_exception_date,
                                                 end_exception_date)
VALUES ($1, $2, $3, $4) RETURNING *;

-- name: GetReoccurringReservationExceptionDuplicates :many
SELECT *
FROM reoccurring_reservations_exceptions
WHERE reoccurring_reservation_id = $1
  AND start_exception_date = $2
  AND end_exception_date = $3;

-- name: GetReoccurringReservationExceptions :many
SELECT *
FROM reoccurring_reservations_exceptions
WHERE reoccurring_reservation_id = $1;

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

-- name: ReoccurringReservationsOfWorkplaceAndUserInTimespan :many
SELECT reservation.*, reoccurring.*
FROM (SELECT *
      FROM reservations
      WHERE reserving_user_id = $1
        AND reserved_workplace_id = $2
        AND start_date <= TO_DATE($3, 'YYYY/MM/DD')) AS reservation
         INNER JOIN (SELECT *
                     FROM reoccurring_reservations
                     WHERE reoccurring_reservations.repeat_until >=
                           (SELECT TO_DATE($3, 'YYYY/MM/DD') - INTERVAL '1 day' * reoccurring_reservations.interval_in_days)) AS reoccurring
ON reoccurring.repeated_reservation_id = reservation.id;
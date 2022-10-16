-- name: CreateReoccurringReservation :one
INSERT INTO reoccurring_reservations (id, interval_in_days, repeated_reservation_id, repeat_until)
VALUES ($1, $2, $3, $4) RETURNING *;

-- name: ActiveReoccurringReservationsOfUser :many
SELECT reoccurringReservationsWithStartDate.*, workplaces.name AS workplaceName
FROM (SELECT activeReoccuringReservations.*, reservationsOfUser.start_date, reservationsOfUser.reserved_workplace_id
      FROM (SELECT *
            FROM reservations
            WHERE reservations.reserving_user_id = $1) AS reservationsOfUser
               JOIN (SELECT *
                     FROM reoccurring_reservations
                     WHERE repeat_until >= (SELECT NOW())) AS activeReoccuringReservations
                    ON activeReoccuringReservations.repeated_reservation_id =
                       reservationsOfUser.id) AS reoccurringReservationsWithStartDate
         JOIN workplaces
              ON workplaces.id = reoccurringReservationsWithStartDate.reserved_workplace_id;

-- name: ActiveReoccurringReservationsOfAllUsers :many
SELECT reoccurringReservationsWithStartDate.*, workplaces.name AS workplaceName
FROM (SELECT activeReoccuringReservations.*, reservationsOfUser.start_date, reservationsOfUser.reserved_workplace_id
      FROM (SELECT *
            FROM reoccurring_reservations
            WHERE repeat_until >= (SELECT NOW())) AS test) AS activeReoccuringReservations
         JOIN workplaces
              ON workplaces.id = activeReoccuringReservations.reserved_workplace_id;

-- name: GetReoccurringReservationByRepeatedReservationId :one
SELECT *
FROM reoccurring_reservations
WHERE repeated_reservation_id = $1;

-- name: GetReoccurringReservationById :one
SELECT *
FROM reoccurring_reservations
WHERE id = $1;

-- name: DeleteReoccurringReservationById :execresult
DELETE
FROM reoccurring_reservations
WHERE id = $1;

-- name: DeleteExceptionsById :execresult
DELETE
FROM reoccurring_reservations_exceptions
WHERE reoccurring_reservation_id = $1;

-- name: UpdateReoccurringReservation :execresult
UPDATE reoccurring_reservations
SET repeat_until = $2
WHERE id = $1;

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
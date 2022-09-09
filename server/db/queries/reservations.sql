-- name: ReserveWorkplace :one
INSERT INTO reservations (id, start_date, end_date, reserving_user_id, reserved_workplace_id)
VALUES ($1, $2, $3, $4, $5) RETURNING *;

-- name: RetrieveReservationsInTimespan :many
SELECT *
FROM reservations
WHERE start_date BETWEEN $1 AND $2
   OR end_date BETWEEN $1 AND $2;

-- name: ExcludedReservationsInTimespan :many
SELECT DISTINCT singleReservationsInTimespan.id
FROM (SELECT *
      FROM reservations as reservations1
      WHERE reservations1.start_date BETWEEN $1 AND $2
         OR reservations1.end_date BETWEEN $1 AND $2) AS singleReservationsInTimespan,
     (SELECT reservationsInTimespanWithReoccurringId.*,
             reoccurring_reservations_exceptions.id AS exceptionId,
             reoccurring_reservations_exceptions.start_exception_date,
             reoccurring_reservations_exceptions.end_exception_date
      FROM (SELECT reservationsInTimespan.*, reoccurring_reservations.id AS reoccurringReservationId
            FROM (SELECT *
                  FROM reservations
                  WHERE start_date BETWEEN $1 AND $2
                     OR end_date BETWEEN $1 AND $2) AS reservationsInTimespan
                     JOIN reoccurring_reservations
                          ON reoccurring_reservations.repeated_reservation_id =
                             reservationsInTimespan.id) AS reservationsInTimespanWithReoccurringId
               JOIN reoccurring_reservations_exceptions
                    ON reoccurring_reservations_exceptions.reoccurring_reservation_id =
                       reservationsInTimespanWithReoccurringId.reoccurringReservationId) reservationsWithExceptions
WHERE reservationsWithExceptions.id = singleReservationsInTimespan.id;

-- name: GetReservationById :one
SELECT *
FROM reservations
WHERE id = $1;

-- name: DeleteReservation :execresult
DELETE
FROM reservations
WHERE id = $1;

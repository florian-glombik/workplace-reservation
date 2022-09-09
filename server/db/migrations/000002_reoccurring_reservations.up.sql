CREATE TABLE IF NOT EXISTS reoccurring_reservations
(
    id                      UUID PRIMARY KEY UNIQUE NOT NULL,
    interval_in_days        int                     NOT NULL,
    repeated_reservation_id UUID                    NOT NULL,
    repeat_until            TIMESTAMPTZ             NOT NULL,
    FOREIGN KEY (repeated_reservation_id) REFERENCES reservations (id)
);

CREATE TABLE IF NOT EXISTS reoccurring_reservations_exceptions
(
    id                         UUID PRIMARY KEY UNIQUE NOT NULL,
    reoccurring_reservation_id UUID                    NOT NULL,
    start_exception_date       TIMESTAMPTZ             NOT NULL,
    end_exception_date         TIMESTAMPTZ             NOT NULL,
    FOREIGN KEY (reoccurring_reservation_id) REFERENCES reoccurring_reservations (id)
);
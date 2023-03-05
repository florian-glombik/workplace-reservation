ALTER TABLE workplaces
    ADD FOREIGN KEY (office_id) REFERENCES offices (id);

ALTER TABLE reservations
    ADD FOREIGN KEY (reserved_workplace_id) REFERENCES workplaces (id);

ALTER TABLE reoccurring_reservations_exceptions
    ADD FOREIGN KEY (reoccurring_reservation_id) REFERENCES reoccurring_reservations (id);
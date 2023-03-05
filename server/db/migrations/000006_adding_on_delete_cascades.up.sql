begin;

ALTER TABLE workplaces DROP CONSTRAINT workplaces_office_id_fkey CASCADE;

-- ALTER TABLE workplaces
--     DROP CONSTRAINT workplaces_office_id_fkey CASCADE ;
--
-- ALTER TABLE reoccurring_reservations_exceptions
--     DROP CONSTRAINT reoccurring_reservations_exceptions_pkey;
--
-- ALTER TABLE reservations
--     DROP CONSTRAINT reservations_pkey;

-- ALTER TABLE reoccurring_reservations
--     DROP CONSTRAINT reoccurring_reservations_repeated_reservation_id_fkey CASCADE;

-- ALTER TABLE workplaces
--     ADD FOREIGN KEY (office_id) REFERENCES offices (id) ON DELETE CASCADE;
--
-- ALTER TABLE reservations
--     ADD FOREIGN KEY (reserved_workplace_id) REFERENCES workplaces (id) ON DELETE CASCADE;
--
-- ALTER TABLE reoccurring_reservations_exceptions
--     ADD FOREIGN KEY (reoccurring_reservation_id) REFERENCES reoccurring_reservations (id) ON DELETE CASCADE;

commit;
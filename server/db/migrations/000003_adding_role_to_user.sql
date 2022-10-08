ALTER TABLE users
DROP
COLUMN role;

ALTER TABLE users
    ADD first_name VARCHAR(50);

ALTER TABLE users
    ADD last_name VARCHAR(50);
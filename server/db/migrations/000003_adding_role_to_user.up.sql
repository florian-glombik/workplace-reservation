ALTER TABLE users
    ADD role varchar(128) NOT NULL DEFAULT 'user';

ALTER TABLE users
DROP
COLUMN first_name;

ALTER TABLE users
DROP
COLUMN last_name;
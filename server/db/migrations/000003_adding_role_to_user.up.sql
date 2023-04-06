ALTER TABLE users
    ADD role varchar(128) NOT NULL DEFAULT 'user';

-- first_name and last_name not needed
ALTER TABLE users
DROP
COLUMN first_name;

ALTER TABLE users
DROP
COLUMN last_name;
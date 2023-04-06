CREATE TABLE IF NOT EXISTS users
(
    id         UUID PRIMARY KEY UNIQUE NOT NULL,
    username   VARCHAR(50),
    first_name VARCHAR(50),
    last_name  VARCHAR(50),
    password   VARCHAR(128)            NOT NULL,
    email      VARCHAR(62) UNIQUE      NOT NULL
);

CREATE TABLE IF NOT EXISTS offices
(
    id          UUID PRIMARY KEY UNIQUE NOT NULL,
    name        VARCHAR(50),
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS workplaces
(
    id          UUID PRIMARY KEY UNIQUE NOT NULL,
    name        VARCHAR(50),
    description VARCHAR(255),
    office_id   UUID,
    FOREIGN KEY (office_id) REFERENCES offices (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reservations
(
    id                    UUID PRIMARY KEY UNIQUE NOT NULL,
    start_date            TIMESTAMPTZ             NOT NULL,
    end_date              TIMESTAMPTZ             NOT NULL,
    reserving_user_id     UUID                    NOT NULL,
    reserved_workplace_id UUID                    NOT NULL,
    FOREIGN KEY (reserving_user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (reserved_workplace_id) REFERENCES workplaces (id) ON DELETE CASCADE
);
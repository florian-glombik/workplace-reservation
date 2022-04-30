CREATE TABLE IF NOT EXISTS users
(
    id         VARCHAR(36) PRIMARY KEY UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name  VARCHAR(50),
    password   VARCHAR(128)                   NOT NULL,
    email      VARCHAR(62) UNIQUE             NOT NULL
);

CREATE TABLE IF NOT EXISTS offices
(
    id          VARCHAR(36) PRIMARY KEY UNIQUE NOT NULL,
    name        VARCHAR(50),
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS workplaces
(
    id          VARCHAR(36) PRIMARY KEY UNIQUE NOT NULL,
    name        VARCHAR(50),
    description VARCHAR(255),
    office_id   VARCHAR(36),
    FOREIGN KEY (office_id) REFERENCES offices (id)
);

CREATE TABLE IF NOT EXISTS reservations
(
    id                    VARCHAR(36) PRIMARY KEY UNIQUE NOT NULL,
    start_date            TIMESTAMPTZ                    NOT NULL,
    end_date              TIMESTAMPTZ,
    reserving_user_id     VARCHAR(36)                    NOT NULL,
    reserved_workplace_id VARCHAR(36)                    NOT NULL,
    FOREIGN KEY (reserving_user_id) REFERENCES users (id),
    FOREIGN KEY (reserved_workplace_id) REFERENCES workplaces (id)
);
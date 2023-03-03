ALTER TABLE offices
    ADD COLUMN IF NOT EXISTS location VARCHAR(255) NOT NULL default 'Location unknown';

ALTER TABLE offices
    ADD COLUMN IF NOT EXISTS location_url VARCHAR(255);

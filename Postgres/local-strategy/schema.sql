-- install "uuid-ossp" extension to generate uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.users (
    -- use uuid_generate_v4() to generate uid
    id UUID DEFAULT uuid_generate_v4 (), 
    username VARCHAR(128) UNIQUE NOT NULL,
    -- hash the salted password on the server-side and only store hash here
    pwdHash VARCHAR(128) NOT NULL,
    -- NOTE: lower-case the email address in server-side
    email VARCHAR(128) UNIQUE,
    firstname VARCHAR(64),
    lastname VARCHAR(64),
    admin BOOLEAN DEFAULT FALSE NOT NULL,
    joindate TIMESTAMP DEFAULT statement_timestamp() NOT NULL,
    PRIMARY KEY (id)
);
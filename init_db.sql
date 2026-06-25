-- init_db.sql: run in Postgres to enable pgvector and create tables
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    title TEXT,
    start_time TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transcripts (
    id SERIAL PRIMARY KEY,
    meeting_id INT REFERENCES meetings(id),
    speaker TEXT,
    start REAL,
    end REAL,
    text TEXT
);

CREATE TABLE speakers (
    user_id INT PRIMARY KEY,
    name TEXT,
    embedding VECTOR(256)  -- 256-dim voice embedding
);

-- Example insert (customize as needed):
-- INSERT INTO speakers (user_id,name,embedding) VALUES (1, 'Alice', '[]'::vector);

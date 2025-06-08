CREATE TABLE IF NOT EXISTS requests (
  id           TEXT PRIMARY KEY,
  created_at   TIMESTAMP WITHOUT TIME ZONE,
  status       TEXT,
  postal_area  TEXT,
  street_1     TEXT,
  street_2     TEXT,
  ward         TEXT,
  request_type TEXT,
  division     TEXT,
  section      TEXT
);

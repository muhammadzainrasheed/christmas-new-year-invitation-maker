PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS invitations (
  slug TEXT PRIMARY KEY,
  host_key TEXT NOT NULL,
  creation_key TEXT NOT NULL UNIQUE,
  details TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS replies (
  slug TEXT NOT NULL REFERENCES invitations(slug) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK(kind IN ('rsvp','wish')),
  request_key TEXT NOT NULL,
  name TEXT NOT NULL,
  attending INTEGER,
  guests INTEGER,
  message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(slug,kind,request_key)
);
CREATE TABLE IF NOT EXISTS support (
  ticket TEXT PRIMARY KEY, email TEXT NOT NULL, message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS quotas (
  bucket TEXT NOT NULL, period INTEGER NOT NULL, hits INTEGER NOT NULL,
  PRIMARY KEY(bucket,period)
);

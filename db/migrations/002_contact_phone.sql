ALTER TABLE participant_sessions ADD COLUMN IF NOT EXISTS phone text;
INSERT INTO app_migrations(name) VALUES ('002_contact_phone') ON CONFLICT DO NOTHING;

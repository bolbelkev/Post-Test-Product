BEGIN;
CREATE TABLE IF NOT EXISTS app_migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS quiz_configs (
  slug text PRIMARY KEY,
  config jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS participant_sessions (
  id uuid PRIMARY KEY,
  token_hash text UNIQUE NOT NULL,
  quiz_slug text NOT NULL REFERENCES quiz_configs(slug),
  name text NOT NULL,
  email text,
  config_snapshot jsonb NOT NULL,
  step integer NOT NULL DEFAULT 0 CHECK (step >= 0),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed')),
  recap_correct integer NOT NULL DEFAULT 0,
  recap_total integer NOT NULL DEFAULT 0,
  match_score integer NOT NULL DEFAULT 0,
  clicked_cta_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '30 days'
);
CREATE INDEX IF NOT EXISTS participant_date_idx ON participant_sessions(created_at DESC,id);
CREATE INDEX IF NOT EXISTS participant_email_idx ON participant_sessions(lower(email));
CREATE INDEX IF NOT EXISTS participant_status_idx ON participant_sessions(status,created_at DESC);
CREATE TABLE IF NOT EXISTS participant_answers (
  session_id uuid NOT NULL REFERENCES participant_sessions(id) ON DELETE CASCADE,
  question_key text NOT NULL,
  question_snapshot jsonb NOT NULL,
  answer jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id,question_key)
);
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash text PRIMARY KEY,
  admin_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '12 hours'
);
CREATE TABLE IF NOT EXISTS login_limits (
  key text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 1,
  window_started timestamptz NOT NULL DEFAULT now()
);
INSERT INTO app_migrations(name) VALUES ('001_initial') ON CONFLICT DO NOTHING;
COMMIT;

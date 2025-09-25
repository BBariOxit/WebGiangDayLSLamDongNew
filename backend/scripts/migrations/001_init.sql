-- Roles
CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,
  role_code VARCHAR(30) UNIQUE NOT NULL,
  role_name VARCHAR(100) NOT NULL
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  full_name VARCHAR(150) NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(role_id),
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  is_email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Auth Providers
CREATE TABLE IF NOT EXISTS auth_providers (
  provider_id SERIAL PRIMARY KEY,
  provider_code VARCHAR(40) UNIQUE NOT NULL,
  provider_name VARCHAR(100) NOT NULL
);

-- Link table for OAuth
CREATE TABLE IF NOT EXISTS user_auth_providers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  provider_id INTEGER NOT NULL REFERENCES auth_providers(provider_id) ON DELETE CASCADE,
  provider_user_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),
  provider_avatar VARCHAR(500),
  last_login_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_uap_user_provider ON user_auth_providers(user_id, provider_id);

-- Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  token_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by_ip VARCHAR(64),
  revoked_at TIMESTAMP,
  revoked_by_ip VARCHAR(64),
  reason TEXT,
  expires_at TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rt_token ON refresh_tokens(token);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  lesson_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  summary VARCHAR(500),
  content_html TEXT,
  created_by INTEGER REFERENCES users(user_id),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON lessons(slug);

-- Triggers to update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_lessons_updated_at ON lessons;
CREATE TRIGGER trg_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

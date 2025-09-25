-- Seed roles
INSERT INTO roles (role_code, role_name) VALUES
  ('Admin','Administrator'),
  ('Teacher','Teacher'),
  ('Student','Student')
ON CONFLICT (role_code) DO NOTHING;

-- Seed auth provider Google
INSERT INTO auth_providers (provider_code, provider_name) VALUES ('google','Google')
ON CONFLICT (provider_code) DO NOTHING;

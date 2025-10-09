-- Seed demo users with hashed passwords (005)
-- Password for all demo users: "demo123"
-- Hashed using bcrypt with salt rounds 10

DO $$
DECLARE
  admin_role_id INT;
  teacher_role_id INT;
  student_role_id INT;
BEGIN
  -- Get role IDs
  SELECT role_id INTO admin_role_id FROM roles WHERE role_code = 'Admin';
  SELECT role_id INTO teacher_role_id FROM roles WHERE role_code = 'Teacher';
  SELECT role_id INTO student_role_id FROM roles WHERE role_code = 'Student';

  -- Insert admin user
  INSERT INTO users (email, password_hash, full_name, role_id, status, is_email_verified)
  SELECT 
    'admin@lamdong.edu.vn',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- demo123
    'Admin Hệ thống',
    admin_role_id,
    'Active',
    true
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@lamdong.edu.vn');

  -- Insert teacher user
  INSERT INTO users (email, password_hash, full_name, role_id, status, is_email_verified)
  SELECT 
    'teacher@lamdong.edu.vn',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- demo123
    'GV. Nguyễn Văn A',
    teacher_role_id,
    'Active',
    true
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'teacher@lamdong.edu.vn');

  -- Insert student user
  INSERT INTO users (email, password_hash, full_name, role_id, status, is_email_verified)
  SELECT 
    'student@lamdong.edu.vn',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- demo123
    'HS. Trần Thị B',
    student_role_id,
    'Active',
    true
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'student@lamdong.edu.vn');

END $$;

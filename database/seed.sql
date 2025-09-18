USE HistoryEduDB;
GO

/* Seed Roles */
SET IDENTITY_INSERT dbo.Roles ON;
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleCode='Admin')
INSERT INTO dbo.Roles(RoleId, RoleCode, RoleName) VALUES (1,'Admin',N'Quản trị viên');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleCode='Teacher')
INSERT INTO dbo.Roles(RoleId, RoleCode, RoleName) VALUES (2,'Teacher',N'Giáo viên');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleCode='Student')
INSERT INTO dbo.Roles(RoleId, RoleCode, RoleName) VALUES (3,'Student',N'Học viên');
SET IDENTITY_INSERT dbo.Roles OFF;

/* Admin User (password hash placeholder - store proper hash later) */
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email='admin@history.local')
BEGIN
  INSERT INTO dbo.Users(Email, PasswordHash, FullName, RoleId, Status, IsEmailVerified)
  VALUES ('admin@history.local', 0x00, N'Quản trị hệ thống', 1, 'Active', 1);
END;

/* Example Lessons */
IF NOT EXISTS (SELECT 1 FROM dbo.Lessons)
BEGIN
  INSERT INTO dbo.Lessons(Title, Slug, ContentHtml, CreatedBy, IsPublished)
  SELECT N'Lâm Đồng thời kỳ hình thành', 'lam-dong-lich-su-hinh-thanh', N'<h2>Lịch sử hình thành</h2><p>Nội dung giới thiệu...</p>', u.UserId, 1
  FROM dbo.Users u WHERE u.Email='admin@history.local';
END;

/* Example Quiz + Questions */
DECLARE @LessonId INT = (SELECT TOP 1 LessonId FROM dbo.Lessons ORDER BY LessonId);
IF NOT EXISTS (SELECT 1 FROM dbo.Quizzes WHERE Title=N'Quiz Khởi đầu')
BEGIN
  DECLARE @Admin INT = (SELECT UserId FROM dbo.Users WHERE Email='admin@history.local');
  INSERT INTO dbo.Quizzes(LessonId, Title, Description, CreatedBy, IsPublished)
  VALUES (@LessonId, N'Quiz Khởi đầu', N'Câu hỏi cơ bản về lịch sử Lâm Đồng', @Admin, 1);
  DECLARE @QuizId INT = SCOPE_IDENTITY();
  INSERT INTO dbo.Questions(QuizId, QuestionText, OptionsJson, AnswerKey, Points, OrderIndex)
  VALUES
    (@QuizId, N'Lâm Đồng thuộc vùng nào của Việt Nam?', N'["Tây Bắc","Tây Nguyên","Đông Nam Bộ","Đồng bằng Sông Cửu Long"]', 'B', 2, 1),
    (@QuizId, N'Thành phố Đà Lạt nổi tiếng với loại hoa nào?', N'["Hoa sen","Hoa hồng","Hoa dã quỳ","Hoa mai anh đào"]', 'D', 1, 2);
END;

PRINT 'Seed data inserted.';

/* =====================================================
   Seed Authentication Providers (local + google)
   Idempotent inserts
===================================================== */
IF NOT EXISTS (SELECT 1 FROM dbo.AuthProviders WHERE ProviderCode='local')
  INSERT INTO dbo.AuthProviders(ProviderCode, ProviderName, IsOAuth) VALUES ('local', N'Tài khoản nội bộ', 0);
IF NOT EXISTS (SELECT 1 FROM dbo.AuthProviders WHERE ProviderCode='google')
  INSERT INTO dbo.AuthProviders(ProviderCode, ProviderName, IsOAuth) VALUES ('google', N'Google OAuth', 1);

/* Map admin user to local provider */
DECLARE @AdminId INT = (SELECT UserId FROM dbo.Users WHERE Email='admin@history.local');
DECLARE @LocalProviderId INT = (SELECT ProviderId FROM dbo.AuthProviders WHERE ProviderCode='local');
IF @AdminId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.UserAuthProviders WHERE UserId=@AdminId AND ProviderId=@LocalProviderId)
BEGIN
  INSERT INTO dbo.UserAuthProviders(UserId, ProviderId, ProviderUserId, ProviderEmail, LastLoginAt)
  VALUES (@AdminId, @LocalProviderId, CAST(@AdminId AS NVARCHAR(50)), 'admin@history.local', SYSUTCDATETIME());
END;

/* Optional: demo Google-linked teacher account */
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email='teacher.google@test.com')
BEGIN
  DECLARE @TeacherRole INT = (SELECT RoleId FROM dbo.Roles WHERE RoleCode='Teacher');
  INSERT INTO dbo.Users(Email, PasswordHash, FullName, RoleId, Status, IsEmailVerified)
  VALUES ('teacher.google@test.com', NULL, N'Giáo viên Google Demo', @TeacherRole, 'Active', 1);
  DECLARE @TeacherId INT = SCOPE_IDENTITY();
  DECLARE @GoogleProviderId INT = (SELECT ProviderId FROM dbo.AuthProviders WHERE ProviderCode='google');
  INSERT INTO dbo.UserAuthProviders(UserId, ProviderId, ProviderUserId, ProviderEmail, ProviderAvatar, LastLoginAt)
  VALUES (@TeacherId, @GoogleProviderId, 'google-sub-demo-123', 'teacher.google@test.com', NULL, SYSUTCDATETIME());
END;

/* Sample verification token for admin email (if none) */
IF NOT EXISTS (SELECT 1 FROM dbo.VerificationTokens WHERE UserId=@AdminId AND Type='EmailVerify')
BEGIN
  INSERT INTO dbo.VerificationTokens(UserId, Token, Type, ExpiresAt)
  VALUES (@AdminId, 'demo-verify-token-admin', 'EmailVerify', DATEADD(day, 7, SYSUTCDATETIME()));
END;

PRINT 'Auth providers & mappings seeded.';

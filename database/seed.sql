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

/* Sample Users (password hash placeholder 0x00 -> replace by script set-dev-passwords) */
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email='admin@history.local')
  INSERT INTO dbo.Users(Email, PasswordHash, FullName, RoleId, Status, IsEmailVerified)
  VALUES ('admin@history.local', 0x00, N'Quản trị hệ thống', 1, 'Active', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email='teacher.local@test.com')
  INSERT INTO dbo.Users(Email, PasswordHash, FullName, RoleId, Status, IsEmailVerified)
  VALUES ('teacher.local@test.com', 0x00, N'Giáo viên Local', 2, 'Active', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email='student.local@test.com')
  INSERT INTO dbo.Users(Email, PasswordHash, FullName, RoleId, Status, IsEmailVerified)
  VALUES ('student.local@test.com', 0x00, N'Học viên Local', 3, 'Active', 1);

/* Example Lessons */
IF NOT EXISTS (SELECT 1 FROM dbo.Lessons)
BEGIN
  INSERT INTO dbo.Lessons(Title, Slug, Summary, ContentHtml, CreatedBy, IsPublished)
  SELECT N'Lâm Đồng thời kỳ hình thành', 'lam-dong-lich-su-hinh-thanh', N'Giới thiệu giai đoạn hình thành', N'<h2>Lịch sử hình thành</h2><p>Nội dung giới thiệu...</p>', u.UserId, 1
  FROM dbo.Users u WHERE u.Email='admin@history.local';
  INSERT INTO dbo.Lessons(Title, Slug, Summary, ContentHtml, CreatedBy, IsPublished)
  SELECT N'Địa lý và khí hậu', 'dia-ly-khi-hau', N'Khái quát địa lý, khí hậu Lâm Đồng', N'<p>Địa lý, khí hậu ảnh hưởng lịch sử...</p>', u.UserId, 1
  FROM dbo.Users u WHERE u.Email='teacher.local@test.com';
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

/* Map local provider for sample users */
DECLARE @LocalProviderId INT = (SELECT ProviderId FROM dbo.AuthProviders WHERE ProviderCode='local');
IF @LocalProviderId IS NOT NULL
BEGIN
  DECLARE @EmailList TABLE(Email VARCHAR(255));
  INSERT INTO @EmailList(Email) VALUES ('admin@history.local'),('teacher.local@test.com'),('student.local@test.com');
  DECLARE @E VARCHAR(255);
  DECLARE cur CURSOR FOR SELECT Email FROM @EmailList;
  OPEN cur; FETCH NEXT FROM cur INTO @E;
  WHILE @@FETCH_STATUS = 0
  BEGIN
    DECLARE @Uid INT = (SELECT UserId FROM dbo.Users WHERE Email=@E);
    IF @Uid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.UserAuthProviders WHERE UserId=@Uid AND ProviderId=@LocalProviderId)
      INSERT INTO dbo.UserAuthProviders(UserId, ProviderId, ProviderUserId, ProviderEmail, LastLoginAt)
      VALUES (@Uid, @LocalProviderId, CAST(@Uid AS NVARCHAR(50)), @E, SYSUTCDATETIME());
    FETCH NEXT FROM cur INTO @E;
  END
  CLOSE cur; DEALLOCATE cur;
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

/* Sample verification tokens (admin + teacher) */
DECLARE @AdminId INT = (SELECT UserId FROM dbo.Users WHERE Email='admin@history.local');
DECLARE @TeacherLocalId INT = (SELECT UserId FROM dbo.Users WHERE Email='teacher.local@test.com');
IF @AdminId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.VerificationTokens WHERE UserId=@AdminId AND Type='EmailVerify')
  INSERT INTO dbo.VerificationTokens(UserId, Token, Type, ExpiresAt)
  VALUES (@AdminId, 'verify-admin-demo', 'EmailVerify', DATEADD(day, 7, SYSUTCDATETIME()));
IF @TeacherLocalId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.VerificationTokens WHERE UserId=@TeacherLocalId AND Type='EmailVerify')
  INSERT INTO dbo.VerificationTokens(UserId, Token, Type, ExpiresAt)
  VALUES (@TeacherLocalId, 'verify-teacher-demo', 'EmailVerify', DATEADD(day, 7, SYSUTCDATETIME()));

PRINT 'Auth providers & mappings seeded.';
PRINT 'Sample users inserted: admin@history.local, teacher.local@test.com, student.local@test.com (password placeholder)';

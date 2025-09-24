/*
  Database Schema for Giang Day Lich Su Lam Dong
  SQL Server (MSSQL)
*/

IF DB_ID('HistoryEduDB') IS NULL
BEGIN
  CREATE DATABASE HistoryEduDB;
END;
GO

USE HistoryEduDB;
GO

/* ======================================================
   1. Lookup Tables
====================================================== */
IF OBJECT_ID('dbo.Roles','U') IS NOT NULL DROP TABLE dbo.Roles;
CREATE TABLE dbo.Roles(
  RoleId       INT IDENTITY(1,1) PRIMARY KEY,
  RoleCode     VARCHAR(30) NOT NULL UNIQUE, -- Admin / Teacher / Student
  RoleName     NVARCHAR(100) NOT NULL,
  CreatedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

/* ======================================================
   2. Users & Profile Extension
====================================================== */
IF OBJECT_ID('dbo.Users','U') IS NOT NULL DROP TABLE dbo.Users;
CREATE TABLE dbo.Users(
  UserId       INT IDENTITY(1,1) PRIMARY KEY,
  Email        VARCHAR(255) NOT NULL UNIQUE,
  PasswordHash VARBINARY(256) NULL, -- For local login (can be NULL if only external auth)
  FullName     NVARCHAR(150) NOT NULL,
  RoleId       INT NOT NULL FOREIGN KEY REFERENCES dbo.Roles(RoleId),
  Status       VARCHAR(20) NOT NULL DEFAULT 'Active', -- Active / Pending / Disabled
  IsEmailVerified BIT NOT NULL DEFAULT 0,
  AvatarUrl    NVARCHAR(500) NULL,
  CreatedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt    DATETIME2 NULL,
  CONSTRAINT CK_Users_Status CHECK (Status IN ('Active','Pending','Disabled'))
);

/* Teacher pending approval history */
IF OBJECT_ID('dbo.TeacherApprovals','U') IS NOT NULL DROP TABLE dbo.TeacherApprovals;
CREATE TABLE dbo.TeacherApprovals(
  ApprovalId  INT IDENTITY(1,1) PRIMARY KEY,
  UserId      INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(UserId) ON DELETE CASCADE,
  RequestedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  ApprovedAt  DATETIME2 NULL,
  ApprovedBy  INT NULL FOREIGN KEY REFERENCES dbo.Users(UserId),
  Status      VARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending / Approved / Rejected
  Note        NVARCHAR(500) NULL,
  CONSTRAINT CK_TeacherApprovals_Status CHECK (Status IN ('Pending','Approved','Rejected'))
);

/* ======================================================
   3. Lessons & Courses (Simple: treat Lesson as single unit)
====================================================== */
IF OBJECT_ID('dbo.Lessons','U') IS NOT NULL DROP TABLE dbo.Lessons;
CREATE TABLE dbo.Lessons(
  LessonId     INT IDENTITY(1,1) PRIMARY KEY,
  Title        NVARCHAR(255) NOT NULL,
  Slug         VARCHAR(255) NOT NULL UNIQUE,
  Summary      NVARCHAR(500) NULL,
  ContentHtml  NVARCHAR(MAX) NULL,
  CreatedBy    INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(UserId),
  CreatedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt    DATETIME2 NULL,
  IsPublished  BIT NOT NULL DEFAULT 0
);
CREATE INDEX IX_Lessons_CreatedBy ON dbo.Lessons(CreatedBy);

/* Student Lesson Progress */
IF OBJECT_ID('dbo.LessonProgress','U') IS NOT NULL DROP TABLE dbo.LessonProgress;
CREATE TABLE dbo.LessonProgress(
  ProgressId INT IDENTITY(1,1) PRIMARY KEY,
  LessonId   INT NOT NULL FOREIGN KEY REFERENCES dbo.Lessons(LessonId) ON DELETE CASCADE,
  UserId     INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(UserId) ON DELETE CASCADE,
  Status     VARCHAR(20) NOT NULL DEFAULT 'InProgress', -- InProgress / Completed
  LastViewedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CompletedAt  DATETIME2 NULL,
  CONSTRAINT UQ_LessonProgress UNIQUE (LessonId, UserId),
  CONSTRAINT CK_LessonProgress_Status CHECK (Status IN ('InProgress','Completed'))
);

/* ======================================================
   4. Quiz & Questions
====================================================== */
IF OBJECT_ID('dbo.Quizzes','U') IS NOT NULL DROP TABLE dbo.Quizzes;
CREATE TABLE dbo.Quizzes(
  QuizId      INT IDENTITY(1,1) PRIMARY KEY,
  LessonId    INT NULL FOREIGN KEY REFERENCES dbo.Lessons(LessonId) ON DELETE SET NULL,
  Title       NVARCHAR(255) NOT NULL,
  Description NVARCHAR(500) NULL,
  TotalPoints INT NOT NULL DEFAULT 0,
  CreatedBy   INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(UserId),
  CreatedAt   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt   DATETIME2 NULL,
  IsPublished BIT NOT NULL DEFAULT 0
);
CREATE INDEX IX_Quizzes_LessonId ON dbo.Quizzes(LessonId);

IF OBJECT_ID('dbo.Questions','U') IS NOT NULL DROP TABLE dbo.Questions;
CREATE TABLE dbo.Questions(
  QuestionId   INT IDENTITY(1,1) PRIMARY KEY,
  QuizId       INT NOT NULL FOREIGN KEY REFERENCES dbo.Quizzes(QuizId) ON DELETE CASCADE,
  QuestionText NVARCHAR(1000) NOT NULL,
  OptionsJson  NVARCHAR(MAX) NOT NULL, -- JSON array of options
  AnswerKey    NVARCHAR(100) NOT NULL, -- e.g. 'A' or multi 'A;C'
  Points       INT NOT NULL DEFAULT 1,
  OrderIndex   INT NOT NULL DEFAULT 0
);
CREATE INDEX IX_Questions_QuizId ON dbo.Questions(QuizId);

/* ======================================================
   5. Quiz Attempts & Results
====================================================== */
IF OBJECT_ID('dbo.QuizAttempts','U') IS NOT NULL DROP TABLE dbo.QuizAttempts;
CREATE TABLE dbo.QuizAttempts(
  AttemptId    INT IDENTITY(1,1) PRIMARY KEY,
  QuizId       INT NOT NULL FOREIGN KEY REFERENCES dbo.Quizzes(QuizId) ON DELETE CASCADE,
  UserId       INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(UserId) ON DELETE CASCADE,
  StartedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  SubmittedAt  DATETIME2 NULL,
  Score        DECIMAL(5,2) NULL,
  MaxScore     INT NOT NULL,
  Status       VARCHAR(20) NOT NULL DEFAULT 'InProgress', -- InProgress / Submitted / Graded
  CONSTRAINT CK_QuizAttempts_Status CHECK (Status IN ('InProgress','Submitted','Graded')),
  CONSTRAINT UQ_QuizAttempts UNIQUE (QuizId, UserId, StartedAt)
);
CREATE INDEX IX_QuizAttempts_UserId ON dbo.QuizAttempts(UserId);

IF OBJECT_ID('dbo.QuizAttemptAnswers','U') IS NOT NULL DROP TABLE dbo.QuizAttemptAnswers;
CREATE TABLE dbo.QuizAttemptAnswers(
  AttemptAnswerId INT IDENTITY(1,1) PRIMARY KEY,
  AttemptId   INT NOT NULL FOREIGN KEY REFERENCES dbo.QuizAttempts(AttemptId) ON DELETE CASCADE,
  QuestionId  INT NOT NULL FOREIGN KEY REFERENCES dbo.Questions(QuestionId) ON DELETE CASCADE,
  Selected    NVARCHAR(200) NULL, -- JSON or 'A;C'
  IsCorrect   BIT NULL,
  PointsEarned INT NULL,
  CONSTRAINT UQ_AttemptQuestion UNIQUE(AttemptId, QuestionId)
);

/* ======================================================
   6. Reporting / Audit
====================================================== */
IF OBJECT_ID('dbo.ActivityLogs','U') IS NOT NULL DROP TABLE dbo.ActivityLogs;
CREATE TABLE dbo.ActivityLogs(
  LogId      BIGINT IDENTITY(1,1) PRIMARY KEY,
  UserId     INT NULL FOREIGN KEY REFERENCES dbo.Users(UserId) ON DELETE SET NULL,
  Action     VARCHAR(100) NOT NULL, -- LOGIN, CREATE_LESSON, SUBMIT_QUIZ, etc.
  Detail     NVARCHAR(1000) NULL,
  CreatedAt  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_ActivityLogs_UserId ON dbo.ActivityLogs(UserId);

/* ======================================================
   7. Computed or Helper Views (examples)
====================================================== */
IF OBJECT_ID('dbo.vQuizScores','V') IS NOT NULL DROP VIEW dbo.vQuizScores;
GO
CREATE VIEW dbo.vQuizScores AS
SELECT qa.AttemptId, qa.QuizId, qa.UserId, qa.Score, qa.MaxScore,
       CAST(CASE WHEN qa.Score IS NOT NULL AND qa.MaxScore > 0 THEN (qa.Score/qa.MaxScore)*100 END AS DECIMAL(5,2)) AS PercentScore,
       qa.SubmittedAt
FROM dbo.QuizAttempts qa;
GO

IF OBJECT_ID('dbo.vLessonCompletion','V') IS NOT NULL DROP VIEW dbo.vLessonCompletion;
GO
CREATE VIEW dbo.vLessonCompletion AS
SELECT l.LessonId, l.Title, lp.UserId, lp.Status, lp.CompletedAt
FROM dbo.Lessons l
LEFT JOIN dbo.LessonProgress lp ON l.LessonId = lp.LessonId;
GO

/* ======================================================
   8. Triggers (example: auto calculate quiz max score)
====================================================== */
IF OBJECT_ID('dbo.tr_Questions_UpdateQuizPoints','TR') IS NOT NULL DROP TRIGGER dbo.tr_Questions_UpdateQuizPoints;
GO
CREATE TRIGGER dbo.tr_Questions_UpdateQuizPoints ON dbo.Questions
AFTER INSERT, UPDATE, DELETE AS
BEGIN
  SET NOCOUNT ON;
  UPDATE q
  SET TotalPoints = ISNULL(s.SumPts,0)
  FROM dbo.Quizzes q
  OUTER APPLY (
    SELECT SUM(Points) AS SumPts
    FROM dbo.Questions qu
    WHERE qu.QuizId = q.QuizId
  ) s
  WHERE q.QuizId IN (
    SELECT DISTINCT QuizId FROM inserted
    UNION
    SELECT DISTINCT QuizId FROM deleted
  );
END;
GO

/* ======================================================
   9. Security / Future Indices
====================================================== */
CREATE INDEX IX_Users_Role ON dbo.Users(RoleId);
CREATE INDEX IX_Users_Status ON dbo.Users(Status);

/* ======================================================
  10. Authentication Extensions (Local + Google OAuth)
     - AuthProviders: danh sách provider (local, google,...)
     - UserAuthProviders: mapping user với provider ngoài (Google sub id)
     - RefreshTokens: lưu refresh token phục vụ JWT rotation
     - VerificationTokens: xác minh email & đặt lại mật khẩu
====================================================== */

IF OBJECT_ID('dbo.AuthProviders','U') IS NOT NULL DROP TABLE dbo.AuthProviders;
CREATE TABLE dbo.AuthProviders(
  ProviderId    INT IDENTITY(1,1) PRIMARY KEY,
  ProviderCode  VARCHAR(40) NOT NULL UNIQUE, -- 'local', 'google'
  ProviderName  NVARCHAR(120) NOT NULL,
  IsOAuth       BIT NOT NULL DEFAULT 0,
  CreatedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF OBJECT_ID('dbo.UserAuthProviders','U') IS NOT NULL DROP TABLE dbo.UserAuthProviders;
CREATE TABLE dbo.UserAuthProviders(
  UserAuthProviderId BIGINT IDENTITY(1,1) PRIMARY KEY,
  UserId        INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(UserId) ON DELETE CASCADE,
  ProviderId    INT NOT NULL FOREIGN KEY REFERENCES dbo.AuthProviders(ProviderId) ON DELETE CASCADE,
  ProviderUserId NVARCHAR(255) NOT NULL,          -- Google: sub
  ProviderEmail  VARCHAR(255) NULL,               -- Email từ provider (có thể khác email account nếu user đổi)
  ProviderAvatar NVARCHAR(500) NULL,
  AccessToken    NVARCHAR(1000) NULL,             -- (tùy chọn lưu tạm thời)
  RefreshToken   NVARCHAR(1000) NULL,             -- (tùy chọn nếu cần gọi Google API)
  LastLoginAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_UserAuthProviders_UserProvider UNIQUE (UserId, ProviderId),
  CONSTRAINT UQ_UserAuthProviders_ProviderUser UNIQUE (ProviderId, ProviderUserId)
);
CREATE INDEX IX_UserAuthProviders_User ON dbo.UserAuthProviders(UserId);

IF OBJECT_ID('dbo.RefreshTokens','U') IS NOT NULL DROP TABLE dbo.RefreshTokens;
CREATE TABLE dbo.RefreshTokens(
  RefreshTokenId BIGINT IDENTITY(1,1) PRIMARY KEY,
  UserId       INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(UserId) ON DELETE CASCADE,
  Token        VARCHAR(255) NOT NULL UNIQUE,
  ExpiresAt    DATETIME2 NOT NULL,
  CreatedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CreatedByIp  VARCHAR(64) NULL,
  RevokedAt    DATETIME2 NULL,
  RevokedByIp  VARCHAR(64) NULL,
  ReplacedByToken VARCHAR(255) NULL,
  Reason       NVARCHAR(200) NULL
);
CREATE INDEX IX_RefreshTokens_User ON dbo.RefreshTokens(UserId);
CREATE INDEX IX_RefreshTokens_Active ON dbo.RefreshTokens(UserId) WHERE RevokedAt IS NULL AND ExpiresAt > SYSUTCDATETIME();

IF OBJECT_ID('dbo.VerificationTokens','U') IS NOT NULL DROP TABLE dbo.VerificationTokens;
CREATE TABLE dbo.VerificationTokens(
  VerificationTokenId BIGINT IDENTITY(1,1) PRIMARY KEY,
  UserId      INT NOT NULL FOREIGN KEY REFERENCES dbo.Users(UserId) ON DELETE CASCADE,
  Token       VARCHAR(255) NOT NULL UNIQUE,
  Type        VARCHAR(30) NOT NULL,  -- EmailVerify / PasswordReset
  ExpiresAt   DATETIME2 NOT NULL,
  ConsumedAt  DATETIME2 NULL,
  CreatedAt   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT CK_VerificationTokens_Type CHECK (Type IN ('EmailVerify','PasswordReset'))
);
CREATE INDEX IX_VerificationTokens_User ON dbo.VerificationTokens(UserId);
CREATE INDEX IX_VerificationTokens_Active ON dbo.VerificationTokens(UserId, Type) WHERE ConsumedAt IS NULL AND ExpiresAt > SYSUTCDATETIME();

PRINT 'Schema created successfully.';

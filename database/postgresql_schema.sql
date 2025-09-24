-- PostgreSQL Database Schema for Lâm Đồng Learning Management System
-- Version: 1.0
-- Description: Complete schema for users, lessons, quizzes, and progress tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE lesson_difficulty AS ENUM ('Cơ bản', 'Trung bình', 'Nâng cao');
CREATE TYPE quiz_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role user_role DEFAULT 'student',
    google_id VARCHAR(255) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Additional profile fields
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    school VARCHAR(255),
    grade VARCHAR(50),
    
    -- Learning preferences
    preferred_difficulty lesson_difficulty DEFAULT 'Cơ bản',
    learning_goals TEXT[],
    
    -- Statistics
    total_lessons_completed INTEGER DEFAULT 0,
    total_study_time INTEGER DEFAULT 0, -- in minutes
    current_streak INTEGER DEFAULT 0,  -- consecutive days
    best_streak INTEGER DEFAULT 0,
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$')
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    content TEXT NOT NULL, -- HTML content
    summary TEXT,
    
    -- Metadata
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    difficulty lesson_difficulty DEFAULT 'Cơ bản',
    duration INTEGER NOT NULL, -- in minutes
    objectives TEXT[],
    prerequisites TEXT[],
    
    -- Media
    thumbnail_url VARCHAR(500),
    video_url VARCHAR(500),
    audio_url VARCHAR(500),
    images TEXT[], -- Array of image URLs
    
    -- SEO and organization
    tags TEXT[],
    keywords TEXT[],
    meta_description TEXT,
    
    -- Instructor information
    instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    instructor_name VARCHAR(255),
    instructor_bio TEXT,
    
    -- Statistics and ratings
    view_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    
    -- Status and publishing
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    
    CONSTRAINT valid_rating CHECK (average_rating >= 0 AND average_rating <= 5),
    CONSTRAINT valid_duration CHECK (duration > 0)
);

-- Quiz questions table
CREATE TABLE quiz_questions (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'multiple_choice', -- multiple_choice, true_false, fill_blank, essay
    
    -- Options for multiple choice (JSON array)
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    
    -- Difficulty and points
    difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    points INTEGER DEFAULT 1,
    
    -- Order and grouping
    question_order INTEGER DEFAULT 0,
    section_name VARCHAR(255),
    
    -- Media
    image_url VARCHAR(500),
    audio_url VARCHAR(500),
    
    -- Metadata
    tags TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User lesson progress
CREATE TABLE user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Time tracking
    time_spent INTEGER DEFAULT 0, -- in seconds
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Reading position
    last_section VARCHAR(255),
    scroll_position INTEGER DEFAULT 0,
    
    -- Notes and bookmarks
    notes TEXT,
    bookmarked_sections TEXT[],
    is_bookmarked BOOLEAN DEFAULT FALSE,
    
    -- Unique constraint
    UNIQUE(user_id, lesson_id)
);

-- Quiz attempts
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    
    -- Attempt details
    attempt_number INTEGER DEFAULT 1,
    status quiz_status DEFAULT 'not_started',
    
    -- Scoring
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    score_percentage DECIMAL(5,2) DEFAULT 0.00,
    total_points INTEGER DEFAULT 0,
    earned_points INTEGER DEFAULT 0,
    
    -- Timing
    time_limit INTEGER, -- in minutes
    time_spent INTEGER DEFAULT 0, -- in seconds
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results and feedback
    passed BOOLEAN DEFAULT FALSE,
    passing_score INTEGER DEFAULT 70,
    feedback TEXT,
    
    -- Additional data
    answers JSONB, -- Store all answers as JSON
    question_order INTEGER[] -- Randomized question order
);

-- Quiz answers (detailed answers for each question)
CREATE TABLE quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
    
    -- Answer details
    user_answer TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    points_earned INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- in seconds
    
    -- Metadata
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_flagged BOOLEAN DEFAULT FALSE, -- User flagged for review
    
    UNIQUE(attempt_id, question_id)
);

-- User ratings and reviews
CREATE TABLE lesson_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    
    -- Rating and review
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_title VARCHAR(255),
    review_text TEXT,
    
    -- Helpful votes
    helpful_votes INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    
    -- Status
    is_approved BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, lesson_id)
);

-- Achievements system
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    badge_color VARCHAR(7),
    
    -- Requirements
    requirement_type VARCHAR(50), -- lessons_completed, quiz_score, streak, etc.
    requirement_value INTEGER,
    
    -- Rewards
    points_reward INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_displayed BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id, achievement_id)
);

-- Learning paths (sequences of lessons)
CREATE TABLE learning_paths (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    
    -- Path details
    estimated_duration INTEGER, -- total minutes
    difficulty lesson_difficulty DEFAULT 'Cơ bản',
    prerequisites TEXT[],
    learning_outcomes TEXT[],
    
    -- Media
    thumbnail_url VARCHAR(500),
    
    -- Status
    is_published BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Path lessons (ordered lessons in a learning path)
CREATE TABLE path_lessons (
    id SERIAL PRIMARY KEY,
    path_id INTEGER REFERENCES learning_paths(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    
    lesson_order INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    unlock_requirements TEXT[], -- JSON conditions
    
    UNIQUE(path_id, lesson_id),
    UNIQUE(path_id, lesson_order)
);

-- User learning path progress
CREATE TABLE user_path_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    path_id INTEGER REFERENCES learning_paths(id) ON DELETE CASCADE,
    
    -- Progress
    current_lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    completed_lessons INTEGER DEFAULT 0,
    total_lessons INTEGER NOT NULL,
    progress_percentage INTEGER DEFAULT 0,
    
    -- Status
    is_completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, path_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_lessons_slug ON lessons(slug);
CREATE INDEX idx_lessons_category ON lessons(category_id);
CREATE INDEX idx_lessons_difficulty ON lessons(difficulty);
CREATE INDEX idx_lessons_published ON lessons(is_published);
CREATE INDEX idx_lessons_featured ON lessons(is_featured);
CREATE INDEX idx_lessons_created_at ON lessons(created_at);

CREATE INDEX idx_quiz_questions_lesson ON quiz_questions(lesson_id);
CREATE INDEX idx_quiz_questions_active ON quiz_questions(is_active);

CREATE INDEX idx_user_progress_user ON user_lesson_progress(user_id);
CREATE INDEX idx_user_progress_lesson ON user_lesson_progress(lesson_id);
CREATE INDEX idx_user_progress_completed ON user_lesson_progress(is_completed);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_lesson ON quiz_attempts(lesson_id);
CREATE INDEX idx_quiz_attempts_status ON quiz_attempts(status);

CREATE INDEX idx_quiz_answers_attempt ON quiz_answers(attempt_id);
CREATE INDEX idx_quiz_answers_question ON quiz_answers(question_id);

CREATE INDEX idx_lesson_ratings_lesson ON lesson_ratings(lesson_id);
CREATE INDEX idx_lesson_ratings_user ON lesson_ratings(user_id);
CREATE INDEX idx_lesson_ratings_approved ON lesson_ratings(is_approved);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON quiz_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lesson_ratings_updated_at BEFORE UPDATE ON lesson_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
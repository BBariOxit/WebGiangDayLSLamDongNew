# Lâm Đồng Learning Management System - Database

This directory contains the database schema and migration files for the Lâm Đồng Learning Management System.

## Files

### Schema Files

- `postgresql_schema.sql` - Complete PostgreSQL database schema
- `schema.sql` - SQL Server database schema (legacy)
- `sample_data.sql` - Sample data for testing and development

## Database Design

### Core Tables

#### Users & Authentication

- `users` - User accounts with profiles and statistics
- `user_lesson_progress` - Track individual lesson progress
- `user_achievements` - User achievement records

#### Content Management

- `categories` - Lesson categories (History, Geography, Culture, etc.)
- `lessons` - Lesson content with rich HTML and metadata
- `quiz_questions` - Quiz questions for each lesson
- `lesson_ratings` - User ratings and reviews

#### Assessment System

- `quiz_attempts` - Quiz attempt records with scoring
- `quiz_answers` - Detailed answer records
- `achievements` - Achievement definitions

#### Learning Paths

- `learning_paths` - Structured learning sequences
- `path_lessons` - Lessons within each path
- `user_path_progress` - User progress through paths

## Key Features

### User Management

- Role-based access (student, teacher, admin)
- Google OAuth integration support
- Profile management with learning preferences
- Activity tracking and statistics

### Content System

- Rich HTML lesson content
- Multiple difficulty levels
- Media support (images, videos, audio)
- SEO-friendly slugs and metadata
- Versioning support

### Assessment Engine

- Multiple question types
- Automated scoring
- Time tracking
- Review and flagging system
- Detailed analytics

### Progress Tracking

- Granular progress tracking
- Bookmarking and notes
- Reading position saving
- Time spent tracking
- Completion certificates

### Gamification

- Achievement system
- Points and rewards
- Learning streaks
- Progress badges

## Database Setup

### PostgreSQL Setup

1. Create database:

```sql
CREATE DATABASE lamdong_lms;
```

2. Run schema:

```bash
psql -d lamdong_lms -f postgresql_schema.sql
```

3. Load sample data:

```bash
psql -d lamdong_lms -f sample_data.sql
```

### Environment Variables

Required environment variables for database connection:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lamdong_lms
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL=prefer
```

## Schema Versioning

- Current version: 1.0
- Migration files will be added in `migrations/` directory
- Use semantic versioning for schema changes

## Performance Considerations

### Indexes

- Primary keys on all tables
- Foreign key indexes for joins
- Search indexes on frequently queried columns
- Composite indexes for complex queries

### Optimization

- Updated_at triggers for audit trails
- Check constraints for data validation
- Enum types for limited value sets
- JSONB for flexible data storage

## Security

### Data Protection

- Password hashing (bcrypt recommended)
- Email validation constraints
- Role-based access control
- Audit logging capability

### Privacy

- GDPR compliance ready
- User data anonymization support
- Retention policy fields
- Consent tracking capability

## Backup Strategy

### Recommended Approach

- Daily automated backups
- Weekly full database exports
- Monthly archive to cold storage
- Point-in-time recovery setup

### Backup Commands

```bash
# Full backup
pg_dump lamdong_lms > backup_$(date +%Y%m%d).sql

# Schema only
pg_dump --schema-only lamdong_lms > schema_backup.sql

# Data only
pg_dump --data-only lamdong_lms > data_backup.sql
```

## Monitoring

### Key Metrics

- User registration trends
- Lesson completion rates
- Quiz performance analytics
- System response times
- Database growth patterns

### Recommended Tools

- PostgreSQL built-in statistics
- Query performance monitoring
- Connection pooling metrics
- Slow query logging

## Development Notes

### Local Development

- Use Docker containers for consistency
- Seed data for testing scenarios
- Automated migration testing
- Unit tests for database functions

### Testing Data

- Sample users with different roles
- Complete lesson content examples
- Quiz questions with explanations
- Progress tracking scenarios

## Future Enhancements

### Planned Features

- Multi-language content support
- Advanced analytics dashboard
- Real-time collaboration features
- Mobile app synchronization
- AI-powered recommendations

### Schema Evolution

- Flexible content types
- Advanced assessment formats
- Social learning features
- Integration APIs
- Blockchain certificates

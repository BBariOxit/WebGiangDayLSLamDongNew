const express = require('express');
const router = express.Router();
const { checkHealth, query } = require('../config/database');

/**
 * @route GET /api/health
 * @desc Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const dbHealthy = await checkHealth();
    res.json({
      status: 'OK',
      database: dbHealthy ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message,
    });
  }
});

/**
 * @route GET /api/db-test
 * @desc Test database connection with sample queries
 */
router.get('/db-test', async (req, res) => {
  try {
    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const lessonsResult = await query('SELECT COUNT(*) as count FROM lessons');
    const categoriesResult = await query('SELECT COUNT(*) as count FROM categories');
    const achievementsResult = await query('SELECT COUNT(*) as count FROM achievements');
    const questionsResult = await query('SELECT COUNT(*) as count FROM quiz_questions');
    
    res.json({
      success: true,
      message: 'Database connection successful! 🎉',
      data: {
        totalUsers: parseInt(usersResult.rows[0].count),
        totalLessons: parseInt(lessonsResult.rows[0].count),
        totalCategories: parseInt(categoriesResult.rows[0].count),
        totalAchievements: parseInt(achievementsResult.rows[0].count),
        totalQuestions: parseInt(questionsResult.rows[0].count),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/db-users
 * @desc Get all users (for testing)
 */
router.get('/db-users', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY role, id'
    );
    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/db-lessons
 * @desc Get all lessons (for testing)
 */
router.get('/db-lessons', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        l.id, 
        l.title, 
        l.difficulty, 
        l.duration,
        c.name as category_name
      FROM lessons l
      LEFT JOIN categories c ON l.category_id = c.id
      ORDER BY l.id
    `);
    res.json({
      success: true,
      count: result.rows.length,
      lessons: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/db-stats
 * @desc Get database statistics
 */
router.get('/db-stats', async (req, res) => {
  try {
    // Count all tables
    const tables = await query(`
      SELECT 
        tablename,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tablename) as column_count
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    const stats = {};
    for (const table of tables.rows) {
      const countResult = await query(`SELECT COUNT(*) as count FROM ${table.tablename}`);
      stats[table.tablename] = {
        rows: parseInt(countResult.rows[0].count),
        columns: table.column_count,
      };
    }

    res.json({
      success: true,
      totalTables: tables.rows.length,
      tables: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

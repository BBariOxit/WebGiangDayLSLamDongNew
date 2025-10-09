import express from 'express';
import pool from '../config/pool-simple.js';

const router = express.Router();

/**
 * @route GET /api/test/health
 * @desc Health check
 */
router.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 as health');
    res.json({
      status: 'OK',
      database: 'Connected',
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
 * @route GET /api/test/db
 * @desc Test database with counts
 */
router.get('/db', async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const lessonsResult = await pool.query('SELECT COUNT(*) FROM lessons');
    const categoriesResult = await pool.query('SELECT COUNT(*) FROM categories');
    const questionsResult = await pool.query('SELECT COUNT(*) FROM quiz_questions');

    res.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        totalUsers: parseInt(usersResult.rows[0].count),
        totalLessons: parseInt(lessonsResult.rows[0].count),
        totalCategories: parseInt(categoriesResult.rows[0].count),
        totalQuestions: parseInt(questionsResult.rows[0].count),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route GET /api/test/users
 * @desc Get all users
 */
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY id'
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
 * @route GET /api/test/lessons
 * @desc Get all lessons
 */
router.get('/lessons', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, difficulty, duration, category_id FROM lessons ORDER BY id'
    );
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
 * @route GET /api/test/tables
 * @desc List all tables
 */
router.get('/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    res.json({
      success: true,
      count: result.rows.length,
      tables: result.rows.map(r => r.tablename),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

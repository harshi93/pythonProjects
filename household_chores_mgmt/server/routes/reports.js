const express = require('express');
const { getDatabase } = require('../database/init');

const router = express.Router();

// GET /api/reports/user-progress - Get completion progress by user
router.get('/user-progress', (req, res) => {
  const db = getDatabase().getConnection();
  const { period = 'month', start_date, end_date } = req.query;
  
  let dateFilter = '';
  const params = [];
  
  if (start_date && end_date) {
    dateFilter = 'AND c.created_at BETWEEN ? AND ?';
    params.push(start_date, end_date);
  } else {
    // Default to last month
    dateFilter = "AND c.created_at >= date('now', '-1 month')";
  }
  
  const sql = `
    SELECT 
      u.id,
      u.name,
      u.email,
      COUNT(DISTINCT ca.chore_id) as total_assigned,
      COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN ca.chore_id END) as completed,
      COUNT(DISTINCT CASE WHEN c.status = 'pending' THEN ca.chore_id END) as pending,
      COUNT(DISTINCT CASE WHEN c.status = 'in_progress' THEN ca.chore_id END) as in_progress,
      COUNT(DISTINCT CASE WHEN c.due_date < date('now') AND c.status != 'completed' THEN ca.chore_id END) as overdue,
      ROUND(
        (COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN ca.chore_id END) * 100.0) / 
        NULLIF(COUNT(DISTINCT ca.chore_id), 0), 2
      ) as completion_rate
    FROM users u
    LEFT JOIN chore_assignments ca ON u.id = ca.user_id
    LEFT JOIN chores c ON ca.chore_id = c.id
    WHERE 1=1 ${dateFilter}
    GROUP BY u.id, u.name, u.email
    ORDER BY completion_rate DESC, total_assigned DESC
  `;
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching user progress:', err);
      return res.status(500).json({ error: 'Failed to fetch user progress' });
    }
    res.json(rows);
  });
});

// GET /api/reports/user-progress/:user_id - Get specific user's progress
router.get('/user-progress/:user_id', (req, res) => {
  const db = getDatabase().getConnection();
  const userId = req.params.user_id;
  const { period = 'month' } = req.query;
  
  // Get user's detailed progress
  const progressSql = `
    SELECT 
      u.id,
      u.name,
      u.email,
      COUNT(DISTINCT ca.chore_id) as total_assigned,
      COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN ca.chore_id END) as completed,
      COUNT(DISTINCT CASE WHEN c.status = 'pending' THEN ca.chore_id END) as pending,
      COUNT(DISTINCT CASE WHEN c.status = 'in_progress' THEN ca.chore_id END) as in_progress,
      COUNT(DISTINCT CASE WHEN c.due_date < date('now') AND c.status != 'completed' THEN ca.chore_id END) as overdue,
      ROUND(
        (COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN ca.chore_id END) * 100.0) / 
        NULLIF(COUNT(DISTINCT ca.chore_id), 0), 2
      ) as completion_rate
    FROM users u
    LEFT JOIN chore_assignments ca ON u.id = ca.user_id
    LEFT JOIN chores c ON ca.chore_id = c.id
    WHERE u.id = ? AND c.created_at >= date('now', '-1 month')
    GROUP BY u.id
  `;
  
  // Get completion trends over time
  const trendSql = `
    SELECT 
      date(ch.timestamp) as date,
      COUNT(*) as completions
    FROM chore_history ch
    JOIN chores c ON ch.chore_id = c.id
    WHERE ch.user_id = ? AND ch.action = 'completed'
      AND ch.timestamp >= date('now', '-30 days')
    GROUP BY date(ch.timestamp)
    ORDER BY date
  `;
  
  db.get(progressSql, [userId], (err, progress) => {
    if (err) {
      console.error('Error fetching user progress:', err);
      return res.status(500).json({ error: 'Failed to fetch user progress' });
    }
    
    if (!progress) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    db.all(trendSql, [userId], (err, trends) => {
      if (err) {
        console.error('Error fetching completion trends:', err);
        return res.status(500).json({ error: 'Failed to fetch completion trends' });
      }
      
      res.json({
        ...progress,
        completion_trends: trends
      });
    });
  });
});

// GET /api/reports/priority-analysis - Get completion rates by priority
router.get('/priority-analysis', (req, res) => {
  const db = getDatabase().getConnection();
  const { period = 'month' } = req.query;
  
  const sql = `
    SELECT 
      c.priority,
      COUNT(*) as total_chores,
      COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as completed,
      COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending,
      COUNT(CASE WHEN c.status = 'in_progress' THEN 1 END) as in_progress,
      COUNT(CASE WHEN c.due_date < date('now') AND c.status != 'completed' THEN 1 END) as overdue,
      ROUND(
        (COUNT(CASE WHEN c.status = 'completed' THEN 1 END) * 100.0) / COUNT(*), 2
      ) as completion_rate,
      AVG(
        CASE WHEN c.status = 'completed' THEN 
          julianday(c.updated_at) - julianday(c.created_at)
        END
      ) as avg_completion_days
    FROM chores c
    WHERE c.created_at >= date('now', '-1 month')
    GROUP BY c.priority
    ORDER BY 
      CASE c.priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
      END
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching priority analysis:', err);
      return res.status(500).json({ error: 'Failed to fetch priority analysis' });
    }
    res.json(rows);
  });
});

// GET /api/reports/tag-analytics - Get performance metrics by tags
router.get('/tag-analytics', (req, res) => {
  const db = getDatabase().getConnection();
  const { period = 'month' } = req.query;
  
  const sql = `
    SELECT 
      t.id,
      t.name,
      t.color,
      COUNT(DISTINCT c.id) as total_chores,
      COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN c.id END) as completed,
      COUNT(DISTINCT CASE WHEN c.status = 'pending' THEN c.id END) as pending,
      COUNT(DISTINCT CASE WHEN c.status = 'in_progress' THEN c.id END) as in_progress,
      COUNT(DISTINCT CASE WHEN c.due_date < date('now') AND c.status != 'completed' THEN c.id END) as overdue,
      ROUND(
        (COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN c.id END) * 100.0) / 
        NULLIF(COUNT(DISTINCT c.id), 0), 2
      ) as completion_rate
    FROM tags t
    LEFT JOIN chore_tags ct ON t.id = ct.tag_id
    LEFT JOIN chores c ON ct.chore_id = c.id
    WHERE c.created_at >= date('now', '-1 month') OR c.id IS NULL
    GROUP BY t.id, t.name, t.color
    HAVING total_chores > 0
    ORDER BY completion_rate DESC, total_chores DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching tag analytics:', err);
      return res.status(500).json({ error: 'Failed to fetch tag analytics' });
    }
    res.json(rows);
  });
});

// GET /api/reports/completion-trends - Get time-based completion trends
router.get('/completion-trends', (req, res) => {
  const db = getDatabase().getConnection();
  const { period = 'daily', days = 30 } = req.query;
  
  let groupBy, dateFormat;
  switch (period) {
    case 'weekly':
      groupBy = "strftime('%Y-%W', ch.timestamp)";
      dateFormat = "strftime('%Y-%W', ch.timestamp) as period";
      break;
    case 'monthly':
      groupBy = "strftime('%Y-%m', ch.timestamp)";
      dateFormat = "strftime('%Y-%m', ch.timestamp) as period";
      break;
    default: // daily
      groupBy = "date(ch.timestamp)";
      dateFormat = "date(ch.timestamp) as period";
  }
  
  const sql = `
    SELECT 
      ${dateFormat},
      COUNT(*) as completions,
      COUNT(DISTINCT ch.user_id) as active_users,
      COUNT(DISTINCT ch.chore_id) as unique_chores
    FROM chore_history ch
    WHERE ch.action = 'completed' 
      AND ch.timestamp >= date('now', '-${parseInt(days)} days')
    GROUP BY ${groupBy}
    ORDER BY period
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching completion trends:', err);
      return res.status(500).json({ error: 'Failed to fetch completion trends' });
    }
    res.json(rows);
  });
});

// GET /api/reports/dashboard-summary - Get summary data for dashboard
router.get('/dashboard-summary', (req, res) => {
  const db = getDatabase().getConnection();
  
  const queries = {
    // Overall stats
    overall: `
      SELECT 
        COUNT(*) as total_chores,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_chores,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_chores,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_chores,
        COUNT(CASE WHEN due_date < date('now') AND status != 'completed' THEN 1 END) as overdue_chores
      FROM chores
    `,
    
    // Today's completions
    today: `
      SELECT COUNT(*) as today_completions
      FROM chore_history
      WHERE action = 'completed' AND date(timestamp) = date('now')
    `,
    
    // Top performers this week
    topPerformers: `
      SELECT 
        u.name,
        COUNT(*) as completions
      FROM chore_history ch
      JOIN users u ON ch.user_id = u.id
      WHERE ch.action = 'completed' 
        AND ch.timestamp >= date('now', '-7 days')
      GROUP BY u.id, u.name
      ORDER BY completions DESC
      LIMIT 5
    `,
    
    // Most active tags
    activeTags: `
      SELECT 
        t.name,
        t.color,
        COUNT(DISTINCT c.id) as chore_count
      FROM tags t
      JOIN chore_tags ct ON t.id = ct.tag_id
      JOIN chores c ON ct.chore_id = c.id
      WHERE c.created_at >= date('now', '-7 days')
      GROUP BY t.id, t.name, t.color
      ORDER BY chore_count DESC
      LIMIT 5
    `
  };
  
  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;
  
  Object.entries(queries).forEach(([key, sql]) => {
    if (key === 'overall' || key === 'today') {
      db.get(sql, [], (err, row) => {
        if (err) {
          console.error(`Error fetching ${key}:`, err);
          results[key] = null;
        } else {
          results[key] = row;
        }
        
        completed++;
        if (completed === total) {
          res.json(results);
        }
      });
    } else {
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error(`Error fetching ${key}:`, err);
          results[key] = [];
        } else {
          results[key] = rows;
        }
        
        completed++;
        if (completed === total) {
          res.json(results);
        }
      });
    }
  });
});

// GET /api/reports/comparison - Compare user performance
router.get('/comparison', (req, res) => {
  const db = getDatabase().getConnection();
  const { users, period = 'week' } = req.query;
  
  if (!users) {
    return res.status(400).json({ error: 'users parameter is required (comma-separated user IDs)' });
  }
  
  const userIds = users.split(',').map(id => parseInt(id.trim()));
  const placeholders = userIds.map(() => '?').join(',');
  
  let dateFilter;
  switch (period) {
    case 'month':
      dateFilter = "AND c.created_at >= date('now', '-1 month')";
      break;
    case 'year':
      dateFilter = "AND c.created_at >= date('now', '-1 year')";
      break;
    default: // week
      dateFilter = "AND c.created_at >= date('now', '-7 days')";
  }
  
  const sql = `
    SELECT 
      u.id,
      u.name,
      COUNT(DISTINCT ca.chore_id) as total_assigned,
      COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN ca.chore_id END) as completed,
      COUNT(DISTINCT CASE WHEN c.status = 'pending' THEN ca.chore_id END) as pending,
      COUNT(DISTINCT CASE WHEN c.status = 'in_progress' THEN ca.chore_id END) as in_progress,
      COUNT(DISTINCT CASE WHEN c.due_date < date('now') AND c.status != 'completed' THEN ca.chore_id END) as overdue,
      ROUND(
        (COUNT(DISTINCT CASE WHEN c.status = 'completed' THEN ca.chore_id END) * 100.0) / 
        NULLIF(COUNT(DISTINCT ca.chore_id), 0), 2
      ) as completion_rate,
      AVG(
        CASE WHEN c.status = 'completed' THEN 
          julianday(c.updated_at) - julianday(c.created_at)
        END
      ) as avg_completion_days
    FROM users u
    LEFT JOIN chore_assignments ca ON u.id = ca.user_id
    LEFT JOIN chores c ON ca.chore_id = c.id
    WHERE u.id IN (${placeholders}) ${dateFilter}
    GROUP BY u.id, u.name
    ORDER BY completion_rate DESC
  `;
  
  db.all(sql, userIds, (err, rows) => {
    if (err) {
      console.error('Error fetching user comparison:', err);
      return res.status(500).json({ error: 'Failed to fetch user comparison' });
    }
    res.json(rows);
  });
});

// GET /api/reports/export - Export reports (basic implementation)
router.get('/export', (req, res) => {
  const { format = 'json', type = 'user-progress' } = req.query;
  
  if (format !== 'json') {
    return res.status(400).json({ 
      error: 'Only JSON export is currently supported. PDF and Excel export would require additional libraries.' 
    });
  }
  
  // Redirect to the appropriate report endpoint
  switch (type) {
    case 'user-progress':
      req.url = '/user-progress';
      break;
    case 'priority-analysis':
      req.url = '/priority-analysis';
      break;
    case 'tag-analytics':
      req.url = '/tag-analytics';
      break;
    default:
      return res.status(400).json({ error: 'Invalid report type' });
  }
  
  // Set headers for download
  res.setHeader('Content-Disposition', `attachment; filename="${type}-${new Date().toISOString().split('T')[0]}.json"`);
  res.setHeader('Content-Type', 'application/json');
  
  // Handle the request with the appropriate route
  router.handle(req, res);
});

module.exports = router;
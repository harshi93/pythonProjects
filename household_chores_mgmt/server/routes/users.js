const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Validation middleware
const validateUser = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters'),
  body('email').optional().isEmail().withMessage('Must be a valid email address')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/users - List all users
router.get('/', (req, res) => {
  const db = getDatabase().getConnection();
  
  const sql = `
    SELECT u.*, 
           COUNT(ca.id) as assigned_chores,
           COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as completed_chores
    FROM users u
    LEFT JOIN chore_assignments ca ON u.id = ca.user_id
    LEFT JOIN chores c ON ca.chore_id = c.id
    GROUP BY u.id
    ORDER BY u.name
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(rows);
  });
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  const db = getDatabase().getConnection();
  const userId = req.params.id;
  
  const sql = `
    SELECT u.*, 
           COUNT(ca.id) as assigned_chores,
           COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as completed_chores
    FROM users u
    LEFT JOIN chore_assignments ca ON u.id = ca.user_id
    LEFT JOIN chores c ON ca.chore_id = c.id
    WHERE u.id = ?
    GROUP BY u.id
  `;
  
  db.get(sql, [userId], (err, row) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(row);
  });
});

// POST /api/users - Create new user
router.post('/', validateUser, handleValidationErrors, (req, res) => {
  const db = getDatabase().getConnection();
  const { name, email } = req.body;
  
  const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
  
  db.run(sql, [name, email || null], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Failed to create user' });
    }
    
    // Fetch the created user
    db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created user:', err);
        return res.status(500).json({ error: 'User created but failed to fetch details' });
      }
      
      res.status(201).json(row);
    });
  });
});

// PUT /api/users/:id - Update user
router.put('/:id', validateUser, handleValidationErrors, (req, res) => {
  const db = getDatabase().getConnection();
  const userId = req.params.id;
  const { name, email } = req.body;
  
  const sql = 'UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  
  db.run(sql, [name, email || null, userId], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Failed to update user' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Fetch the updated user
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error('Error fetching updated user:', err);
        return res.status(500).json({ error: 'User updated but failed to fetch details' });
      }
      
      res.json(row);
    });
  });
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', (req, res) => {
  const db = getDatabase().getConnection();
  const userId = req.params.id;
  
  // Check if user has assigned chores
  db.get('SELECT COUNT(*) as count FROM chore_assignments WHERE user_id = ?', [userId], (err, row) => {
    if (err) {
      console.error('Error checking user assignments:', err);
      return res.status(500).json({ error: 'Failed to check user assignments' });
    }
    
    if (row.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with assigned chores. Please reassign or complete chores first.' 
      });
    }
    
    // Delete the user
    db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ error: 'Failed to delete user' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully' });
    });
  });
});

// GET /api/users/:id/chores - Get user's assigned chores
router.get('/:id/chores', (req, res) => {
  const db = getDatabase().getConnection();
  const userId = req.params.id;
  const { status, priority } = req.query;
  
  let sql = `
    SELECT c.*, ca.assigned_at, ca.completed_at,
           GROUP_CONCAT(t.name) as tags
    FROM chores c
    JOIN chore_assignments ca ON c.id = ca.chore_id
    LEFT JOIN chore_tags ct ON c.id = ct.chore_id
    LEFT JOIN tags t ON ct.tag_id = t.id
    WHERE ca.user_id = ?
  `;
  
  const params = [userId];
  
  if (status) {
    sql += ' AND c.status = ?';
    params.push(status);
  }
  
  if (priority) {
    sql += ' AND c.priority = ?';
    params.push(priority);
  }
  
  sql += ' GROUP BY c.id ORDER BY c.due_date ASC, c.priority DESC';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching user chores:', err);
      return res.status(500).json({ error: 'Failed to fetch user chores' });
    }
    
    // Parse tags for each chore
    const chores = rows.map(chore => ({
      ...chore,
      tags: chore.tags ? chore.tags.split(',') : []
    }));
    
    res.json(chores);
  });
});

module.exports = router;
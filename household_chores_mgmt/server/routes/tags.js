const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Validation middleware
const validateTag = [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color code')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/tags - List all tags
router.get('/', (req, res) => {
  const db = getDatabase().getConnection();
  
  const sql = `
    SELECT t.*, COUNT(ct.chore_id) as usage_count
    FROM tags t
    LEFT JOIN chore_tags ct ON t.id = ct.tag_id
    GROUP BY t.id
    ORDER BY t.name
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error fetching tags:', err);
      return res.status(500).json({ error: 'Failed to fetch tags' });
    }
    res.json(rows);
  });
});

// GET /api/tags/:id - Get tag by ID
router.get('/:id', (req, res) => {
  const db = getDatabase().getConnection();
  const tagId = req.params.id;
  
  const sql = `
    SELECT t.*, COUNT(ct.chore_id) as usage_count
    FROM tags t
    LEFT JOIN chore_tags ct ON t.id = ct.tag_id
    WHERE t.id = ?
    GROUP BY t.id
  `;
  
  db.get(sql, [tagId], (err, row) => {
    if (err) {
      console.error('Error fetching tag:', err);
      return res.status(500).json({ error: 'Failed to fetch tag' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    res.json(row);
  });
});

// GET /api/tags/:id/chores - Get chores with this tag
router.get('/:id/chores', (req, res) => {
  const db = getDatabase().getConnection();
  const tagId = req.params.id;
  
  const sql = `
    SELECT c.*, 
           GROUP_CONCAT(DISTINCT t2.name) as all_tags,
           GROUP_CONCAT(DISTINCT u.name) as assigned_users
    FROM chores c
    JOIN chore_tags ct ON c.id = ct.chore_id
    LEFT JOIN chore_tags ct2 ON c.id = ct2.chore_id
    LEFT JOIN tags t2 ON ct2.tag_id = t2.id
    LEFT JOIN chore_assignments ca ON c.id = ca.chore_id
    LEFT JOIN users u ON ca.user_id = u.id
    WHERE ct.tag_id = ?
    GROUP BY c.id
    ORDER BY c.due_date ASC, c.priority DESC
  `;
  
  db.all(sql, [tagId], (err, rows) => {
    if (err) {
      console.error('Error fetching tag chores:', err);
      return res.status(500).json({ error: 'Failed to fetch tag chores' });
    }
    
    // Parse tags and assigned users for each chore
    const chores = rows.map(chore => ({
      ...chore,
      all_tags: chore.all_tags ? chore.all_tags.split(',') : [],
      assigned_users: chore.assigned_users ? chore.assigned_users.split(',') : []
    }));
    
    res.json(chores);
  });
});

// POST /api/tags - Create new tag
router.post('/', validateTag, handleValidationErrors, (req, res) => {
  const db = getDatabase().getConnection();
  const { name, color = '#007bff' } = req.body;
  
  const sql = 'INSERT INTO tags (name, color) VALUES (?, ?)';
  
  db.run(sql, [name, color], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Tag name already exists' });
      }
      console.error('Error creating tag:', err);
      return res.status(500).json({ error: 'Failed to create tag' });
    }
    
    // Fetch the created tag
    db.get('SELECT * FROM tags WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        console.error('Error fetching created tag:', err);
        return res.status(500).json({ error: 'Tag created but failed to fetch details' });
      }
      
      res.status(201).json(row);
    });
  });
});

// PUT /api/tags/:id - Update tag
router.put('/:id', validateTag, handleValidationErrors, (req, res) => {
  const db = getDatabase().getConnection();
  const tagId = req.params.id;
  const { name, color } = req.body;
  
  const sql = 'UPDATE tags SET name = ?, color = ? WHERE id = ?';
  
  db.run(sql, [name, color, tagId], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Tag name already exists' });
      }
      console.error('Error updating tag:', err);
      return res.status(500).json({ error: 'Failed to update tag' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    // Fetch the updated tag
    db.get('SELECT * FROM tags WHERE id = ?', [tagId], (err, row) => {
      if (err) {
        console.error('Error fetching updated tag:', err);
        return res.status(500).json({ error: 'Tag updated but failed to fetch details' });
      }
      
      res.json(row);
    });
  });
});

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', (req, res) => {
  const db = getDatabase().getConnection();
  const tagId = req.params.id;
  
  // Check if tag is being used
  db.get('SELECT COUNT(*) as count FROM chore_tags WHERE tag_id = ?', [tagId], (err, row) => {
    if (err) {
      console.error('Error checking tag usage:', err);
      return res.status(500).json({ error: 'Failed to check tag usage' });
    }
    
    if (row.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete tag that is currently assigned to chores. Please remove the tag from all chores first.',
        usage_count: row.count
      });
    }
    
    // Delete the tag
    db.run('DELETE FROM tags WHERE id = ?', [tagId], function(err) {
      if (err) {
        console.error('Error deleting tag:', err);
        return res.status(500).json({ error: 'Failed to delete tag' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Tag not found' });
      }
      
      res.json({ message: 'Tag deleted successfully' });
    });
  });
});

// GET /api/tags/popular - Get most used tags
router.get('/popular', (req, res) => {
  const db = getDatabase().getConnection();
  const { limit = 10 } = req.query;
  
  const sql = `
    SELECT t.*, COUNT(ct.chore_id) as usage_count
    FROM tags t
    LEFT JOIN chore_tags ct ON t.id = ct.tag_id
    GROUP BY t.id
    HAVING usage_count > 0
    ORDER BY usage_count DESC, t.name
    LIMIT ?
  `;
  
  db.all(sql, [parseInt(limit)], (err, rows) => {
    if (err) {
      console.error('Error fetching popular tags:', err);
      return res.status(500).json({ error: 'Failed to fetch popular tags' });
    }
    res.json(rows);
  });
});

module.exports = router;
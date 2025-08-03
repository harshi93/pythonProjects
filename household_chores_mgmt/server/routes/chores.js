const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Validation middleware
const validateChore = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  body('due_date').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed']).withMessage('Status must be pending, in_progress, or completed')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Helper function to log chore history
const logChoreHistory = (db, choreId, userId, action, metadata = null) => {
  const sql = 'INSERT INTO chore_history (chore_id, user_id, action, metadata) VALUES (?, ?, ?, ?)';
  db.run(sql, [choreId, userId, action, metadata ? JSON.stringify(metadata) : null], (err) => {
    if (err) {
      console.error('Error logging chore history:', err);
    }
  });
};

// GET /api/chores - List chores with filters
router.get('/', (req, res) => {
  const db = getDatabase().getConnection();
  const { status, priority, user_id, tags, search, limit = 50, offset = 0 } = req.query;
  
  let sql = `
    SELECT DISTINCT c.*, 
           GROUP_CONCAT(DISTINCT t.name) as tags,
           GROUP_CONCAT(DISTINCT u.name) as assigned_users,
           GROUP_CONCAT(DISTINCT u.id) as assigned_user_ids,
           (
             SELECT ca_single.user_id 
             FROM chore_assignments ca_single 
             WHERE ca_single.chore_id = c.id 
             LIMIT 1
           ) as assigned_user_id
    FROM chores c
    LEFT JOIN chore_tags ct ON c.id = ct.chore_id
    LEFT JOIN tags t ON ct.tag_id = t.id
    LEFT JOIN chore_assignments ca ON c.id = ca.chore_id
    LEFT JOIN users u ON ca.user_id = u.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (status) {
    sql += ' AND c.status = ?';
    params.push(status);
  }
  
  if (priority) {
    sql += ' AND c.priority = ?';
    params.push(priority);
  }
  
  if (user_id) {
    sql += ' AND ca.user_id = ?';
    params.push(user_id);
  }
  
  if (tags) {
    const tagList = tags.split(',').map(tag => tag.trim());
    sql += ` AND c.id IN (
      SELECT DISTINCT ct2.chore_id 
      FROM chore_tags ct2 
      JOIN tags t2 ON ct2.tag_id = t2.id 
      WHERE t2.name IN (${tagList.map(() => '?').join(',')})
    )`;
    params.push(...tagList);
  }
  
  if (search) {
    sql += ' AND (c.title LIKE ? OR c.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  sql += ' GROUP BY c.id ORDER BY c.due_date ASC, c.priority DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error fetching chores:', err);
      return res.status(500).json({ error: 'Failed to fetch chores' });
    }
    
    // Parse tags and assigned users for each chore
    const chores = rows.map(chore => ({
      ...chore,
      tags: chore.tags ? chore.tags.split(',') : [],
      assigned_users: chore.assigned_users ? chore.assigned_users.split(',') : [],
      assigned_user_ids: chore.assigned_user_ids ? chore.assigned_user_ids.split(',').map(id => parseInt(id)) : [],
      assigned_user_id: chore.assigned_user_id ? parseInt(chore.assigned_user_id) : null
    }));
    
    res.json(chores);
  });
});

// GET /api/chores/search - Advanced search endpoint
router.get('/search', (req, res) => {
  // This uses the same logic as the main GET endpoint
  // but provides a dedicated search endpoint as specified in the plan
  req.url = '/';
  router.handle(req, res);
});

// GET /api/chores/:id - Get chore by ID
router.get('/:id', (req, res) => {
  const db = getDatabase().getConnection();
  const choreId = req.params.id;
  
  const sql = `
    SELECT c.*, 
           GROUP_CONCAT(DISTINCT t.name) as tags,
           GROUP_CONCAT(DISTINCT t.id) as tag_ids,
           GROUP_CONCAT(DISTINCT u.name) as assigned_users,
           GROUP_CONCAT(DISTINCT u.id) as assigned_user_ids,
           (
             SELECT ca_single.user_id 
             FROM chore_assignments ca_single 
             WHERE ca_single.chore_id = c.id 
             LIMIT 1
           ) as assigned_user_id
    FROM chores c
    LEFT JOIN chore_tags ct ON c.id = ct.chore_id
    LEFT JOIN tags t ON ct.tag_id = t.id
    LEFT JOIN chore_assignments ca ON c.id = ca.chore_id
    LEFT JOIN users u ON ca.user_id = u.id
    WHERE c.id = ?
    GROUP BY c.id
  `;
  
  db.get(sql, [choreId], (err, row) => {
    if (err) {
      console.error('Error fetching chore:', err);
      return res.status(500).json({ error: 'Failed to fetch chore' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    
    // Parse tags and assigned users
    const chore = {
      ...row,
      tags: row.tags ? row.tags.split(',') : [],
      tag_ids: row.tag_ids ? row.tag_ids.split(',').map(id => parseInt(id)) : [],
      assigned_users: row.assigned_users ? row.assigned_users.split(',') : [],
      assigned_user_ids: row.assigned_user_ids ? row.assigned_user_ids.split(',').map(id => parseInt(id)) : [],
      assigned_user_id: row.assigned_user_id ? parseInt(row.assigned_user_id) : null
    };
    
    res.json(chore);
  });
});

// POST /api/chores - Create new chore
router.post('/', validateChore, handleValidationErrors, (req, res) => {
  const db = getDatabase().getConnection();
  const { title, description, priority = 'medium', due_date, status = 'pending', assigned_user_id } = req.body;
  
  const sql = 'INSERT INTO chores (title, description, priority, due_date, status) VALUES (?, ?, ?, ?, ?)';
  
  db.run(sql, [title, description || null, priority, due_date || null, status], function(err) {
    if (err) {
      console.error('Error creating chore:', err);
      return res.status(500).json({ error: 'Failed to create chore' });
    }
    
    const choreId = this.lastID;
    
    // Log chore creation
    logChoreHistory(db, choreId, null, 'created', { priority, due_date });
    
    // Handle assignment if provided
    const handleAssignment = () => {
      if (assigned_user_id) {
        const assignSql = 'INSERT INTO chore_assignments (chore_id, user_id) VALUES (?, ?)';
        db.run(assignSql, [choreId, assigned_user_id], (assignErr) => {
          if (assignErr) {
            console.error('Error assigning user to chore:', assignErr);
          } else {
            logChoreHistory(db, choreId, assigned_user_id, 'assigned');
          }
          fetchAndReturn();
        });
      } else {
        fetchAndReturn();
      }
    };
    
    // Fetch the created chore with assignment info
    const fetchAndReturn = () => {
      const fetchSql = `
        SELECT c.*, 
               (
                 SELECT ca_single.user_id 
                 FROM chore_assignments ca_single 
                 WHERE ca_single.chore_id = c.id 
                 LIMIT 1
               ) as assigned_user_id
        FROM chores c WHERE c.id = ?
      `;
      db.get(fetchSql, [choreId], (err, row) => {
        if (err) {
          console.error('Error fetching created chore:', err);
          return res.status(500).json({ error: 'Chore created but failed to fetch details' });
        }
        
        const result = {
          ...row,
          assigned_user_id: row.assigned_user_id ? parseInt(row.assigned_user_id) : null
        };
        res.status(201).json(result);
      });
    };
    
    handleAssignment();
  });
});

// PUT /api/chores/:id - Update chore
router.put('/:id', validateChore, handleValidationErrors, (req, res) => {
  const db = getDatabase().getConnection();
  const choreId = req.params.id;
  const { title, description, priority, due_date, status, assigned_user_id } = req.body;
  
  const sql = `
    UPDATE chores 
    SET title = ?, description = ?, priority = ?, due_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;
  
  db.run(sql, [title, description || null, priority, due_date || null, status, choreId], function(err) {
    if (err) {
      console.error('Error updating chore:', err);
      return res.status(500).json({ error: 'Failed to update chore' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    
    // Handle assignment changes
    const handleAssignment = () => {
      // First, get current assignment
      db.get('SELECT user_id FROM chore_assignments WHERE chore_id = ?', [choreId], (err, currentAssignment) => {
        if (err) {
          console.error('Error checking current assignment:', err);
          return fetchAndReturn();
        }
        
        const currentUserId = currentAssignment ? currentAssignment.user_id : null;
        
        // If assignment hasn't changed, skip assignment update
        if (currentUserId === assigned_user_id) {
          return fetchAndReturn();
        }
        
        // Remove current assignment if exists
        if (currentUserId) {
          db.run('DELETE FROM chore_assignments WHERE chore_id = ?', [choreId], (deleteErr) => {
            if (deleteErr) {
              console.error('Error removing current assignment:', deleteErr);
            }
            addNewAssignment();
          });
        } else {
          addNewAssignment();
        }
        
        function addNewAssignment() {
          // Add new assignment if provided
          if (assigned_user_id) {
            const assignSql = 'INSERT INTO chore_assignments (chore_id, user_id) VALUES (?, ?)';
            db.run(assignSql, [choreId, assigned_user_id], (assignErr) => {
              if (assignErr) {
                console.error('Error assigning user to chore:', assignErr);
              } else {
                logChoreHistory(db, choreId, assigned_user_id, 'assigned');
              }
              fetchAndReturn();
            });
          } else {
            fetchAndReturn();
          }
        }
      });
    };
    
    // Fetch the updated chore with assignment info
    const fetchAndReturn = () => {
      const fetchSql = `
        SELECT c.*, 
               (
                 SELECT ca_single.user_id 
                 FROM chore_assignments ca_single 
                 WHERE ca_single.chore_id = c.id 
                 LIMIT 1
               ) as assigned_user_id
        FROM chores c WHERE c.id = ?
      `;
      db.get(fetchSql, [choreId], (err, row) => {
        if (err) {
          console.error('Error fetching updated chore:', err);
          return res.status(500).json({ error: 'Chore updated but failed to fetch details' });
        }
        
        const result = {
          ...row,
          assigned_user_id: row.assigned_user_id ? parseInt(row.assigned_user_id) : null
        };
        res.json(result);
      });
    };
    
    handleAssignment();
  });
});

// PATCH /api/chores/:id/status - Update chore status
router.patch('/:id/status', (req, res) => {
  const db = getDatabase().getConnection();
  const choreId = req.params.id;
  const { status } = req.body;
  
  if (!['pending', 'in_progress', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const sql = 'UPDATE chores SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  
  db.run(sql, [status, choreId], function(err) {
    if (err) {
      console.error('Error updating chore status:', err);
      return res.status(500).json({ error: 'Failed to update chore status' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    
    // Log status change
    logChoreHistory(db, choreId, null, status === 'completed' ? 'completed' : 'started');
    
    // If completed, update assignment completion time
    if (status === 'completed') {
      db.run(
        'UPDATE chore_assignments SET completed_at = CURRENT_TIMESTAMP WHERE chore_id = ? AND completed_at IS NULL',
        [choreId]
      );
    }
    
    res.json({ message: 'Chore status updated successfully', status });
  });
});

// DELETE /api/chores/:id - Delete chore
router.delete('/:id', (req, res) => {
  const db = getDatabase().getConnection();
  const choreId = req.params.id;
  
  db.run('DELETE FROM chores WHERE id = ?', [choreId], function(err) {
    if (err) {
      console.error('Error deleting chore:', err);
      return res.status(500).json({ error: 'Failed to delete chore' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    
    res.json({ message: 'Chore deleted successfully' });
  });
});

// POST /api/chores/:id/assign - Assign user to chore
router.post('/:id/assign', (req, res) => {
  const db = getDatabase().getConnection();
  const choreId = req.params.id;
  const { user_id } = req.body;
  
  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  
  // Check if chore exists
  db.get('SELECT id FROM chores WHERE id = ?', [choreId], (err, chore) => {
    if (err) {
      console.error('Error checking chore:', err);
      return res.status(500).json({ error: 'Failed to check chore' });
    }
    
    if (!chore) {
      return res.status(404).json({ error: 'Chore not found' });
    }
    
    // Check if user exists
    db.get('SELECT id FROM users WHERE id = ?', [user_id], (err, user) => {
      if (err) {
        console.error('Error checking user:', err);
        return res.status(500).json({ error: 'Failed to check user' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if assignment already exists
      db.get('SELECT id FROM chore_assignments WHERE chore_id = ? AND user_id = ?', [choreId, user_id], (err, existing) => {
        if (err) {
          console.error('Error checking existing assignment:', err);
          return res.status(500).json({ error: 'Failed to check existing assignment' });
        }
        
        if (existing) {
          return res.status(400).json({ error: 'User is already assigned to this chore' });
        }
        
        // Create assignment
        const sql = 'INSERT INTO chore_assignments (chore_id, user_id) VALUES (?, ?)';
        db.run(sql, [choreId, user_id], function(err) {
          if (err) {
            console.error('Error creating assignment:', err);
            return res.status(500).json({ error: 'Failed to assign user to chore' });
          }
          
          // Log assignment
          logChoreHistory(db, choreId, user_id, 'assigned');
          
          res.status(201).json({ message: 'User assigned to chore successfully' });
        });
      });
    });
  });
});

// DELETE /api/chores/:id/assign/:user_id - Remove assignment
router.delete('/:id/assign/:user_id', (req, res) => {
  const db = getDatabase().getConnection();
  const choreId = req.params.id;
  const userId = req.params.user_id;
  
  db.run('DELETE FROM chore_assignments WHERE chore_id = ? AND user_id = ?', [choreId, userId], function(err) {
    if (err) {
      console.error('Error removing assignment:', err);
      return res.status(500).json({ error: 'Failed to remove assignment' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    res.json({ message: 'Assignment removed successfully' });
  });
});

// POST /api/chores/:id/tags - Add tag to chore
router.post('/:id/tags', (req, res) => {
  const db = getDatabase().getConnection();
  const choreId = req.params.id;
  const { tag_id } = req.body;
  
  if (!tag_id) {
    return res.status(400).json({ error: 'tag_id is required' });
  }
  
  // Check if assignment already exists
  db.get('SELECT * FROM chore_tags WHERE chore_id = ? AND tag_id = ?', [choreId, tag_id], (err, existing) => {
    if (err) {
      console.error('Error checking existing tag:', err);
      return res.status(500).json({ error: 'Failed to check existing tag' });
    }
    
    if (existing) {
      return res.status(400).json({ error: 'Tag is already assigned to this chore' });
    }
    
    const sql = 'INSERT INTO chore_tags (chore_id, tag_id) VALUES (?, ?)';
    db.run(sql, [choreId, tag_id], function(err) {
      if (err) {
        console.error('Error adding tag to chore:', err);
        return res.status(500).json({ error: 'Failed to add tag to chore' });
      }
      
      res.status(201).json({ message: 'Tag added to chore successfully' });
    });
  });
});

// DELETE /api/chores/:id/tags/:tag_id - Remove tag from chore
router.delete('/:id/tags/:tag_id', (req, res) => {
  const db = getDatabase().getConnection();
  const choreId = req.params.id;
  const tagId = req.params.tag_id;
  
  db.run('DELETE FROM chore_tags WHERE chore_id = ? AND tag_id = ?', [choreId, tagId], function(err) {
    if (err) {
      console.error('Error removing tag from chore:', err);
      return res.status(500).json({ error: 'Failed to remove tag from chore' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Tag assignment not found' });
    }
    
    res.json({ message: 'Tag removed from chore successfully' });
  });
});

module.exports = router;
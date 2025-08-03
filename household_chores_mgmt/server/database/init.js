const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/chores.db');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('📁 Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  createTables() {
    return new Promise((resolve, reject) => {
      const tables = [
        // Users table
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Chores table
        `CREATE TABLE IF NOT EXISTS chores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
          due_date DATE,
          status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Tags table
        `CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(50) UNIQUE NOT NULL,
          color VARCHAR(7) DEFAULT '#007bff',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Chore assignments table
        `CREATE TABLE IF NOT EXISTS chore_assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          chore_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME NULL,
          FOREIGN KEY (chore_id) REFERENCES chores(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
        
        // Chore tags table
        `CREATE TABLE IF NOT EXISTS chore_tags (
          chore_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          PRIMARY KEY (chore_id, tag_id),
          FOREIGN KEY (chore_id) REFERENCES chores(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )`,
        
        // Chore history table for reporting
        `CREATE TABLE IF NOT EXISTS chore_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          chore_id INTEGER NOT NULL,
          user_id INTEGER,
          action TEXT CHECK(action IN ('created', 'assigned', 'started', 'completed', 'overdue')) NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT, -- JSON string for additional context
          FOREIGN KEY (chore_id) REFERENCES chores(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )`
      ];

      let completed = 0;
      const total = tables.length;

      tables.forEach((sql, index) => {
        this.db.run(sql, (err) => {
          if (err) {
            console.error(`Error creating table ${index + 1}:`, err);
            reject(err);
            return;
          }
          
          completed++;
          if (completed === total) {
            console.log('✅ All database tables created successfully');
            resolve();
          }
        });
      });
    });
  }

  insertSampleData() {
    return new Promise((resolve, reject) => {
      const sampleData = [
        // Sample users
        `INSERT OR IGNORE INTO users (name, email) VALUES 
          ('John Doe', 'john@example.com'),
          ('Jane Smith', 'jane@example.com'),
          ('Mike Johnson', 'mike@example.com')`,
        
        // Sample tags
        `INSERT OR IGNORE INTO tags (name, color) VALUES 
          ('Kitchen', '#ff6b6b'),
          ('Bathroom', '#4ecdc4'),
          ('Living Room', '#45b7d1'),
          ('Bedroom', '#96ceb4'),
          ('Outdoor', '#feca57'),
          ('Weekly', '#ff9ff3'),
          ('Daily', '#54a0ff')`
      ];

      let completed = 0;
      const total = sampleData.length;

      sampleData.forEach((sql, index) => {
        this.db.run(sql, (err) => {
          if (err) {
            console.error(`Error inserting sample data ${index + 1}:`, err);
            reject(err);
            return;
          }
          
          completed++;
          if (completed === total) {
            console.log('✅ Sample data inserted successfully');
            resolve();
          }
        });
      });
    });
  }

  getConnection() {
    return this.db;
  }

  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('📁 Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

const database = new Database();

const initializeDatabase = async () => {
  try {
    await database.connect();
    await database.createTables();
    await database.insertSampleData();
    return database;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  getDatabase: () => database,
  Database
};
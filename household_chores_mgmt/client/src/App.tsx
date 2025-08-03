import React, { useState, useEffect } from 'react';
import './App.css';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Chore {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  assigned_user_id?: number;
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface ChoreFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  assigned_user_id?: number;
}

interface UserFormData {
  name: string;
  email: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showChoreModal, setShowChoreModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterUser, setFilterUser] = useState<string>('');
  
  // Form states
  const [choreForm, setChoreForm] = useState<ChoreFormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    assigned_user_id: undefined
  });
  
  const [userForm, setUserForm] = useState<UserFormData>({
    name: '',
    email: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersResponse, choresResponse, tagsResponse] = await Promise.all([
        fetch('http://localhost:3002/api/users'),
        fetch('http://localhost:3002/api/chores'),
        fetch('http://localhost:3002/api/tags')
      ]);

      if (!usersResponse.ok || !choresResponse.ok || !tagsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const usersData = await usersResponse.json();
      const choresData = await choresResponse.json();
      const tagsData = await tagsResponse.json();

      setUsers(usersData);
      setChores(choresData);
      setTags(tagsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // CRUD Functions for Chores
  const handleCreateChore = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/chores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(choreForm)
      });
      if (response.ok) {
        await fetchData();
        setShowChoreModal(false);
        resetChoreForm();
      }
    } catch (err) {
      console.error('Error creating chore:', err);
    }
  };

  const handleUpdateChore = async () => {
    if (!editingChore) return;
    try {
      const response = await fetch(`http://localhost:3002/api/chores/${editingChore.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(choreForm)
      });
      if (response.ok) {
        await fetchData();
        setShowChoreModal(false);
        setEditingChore(null);
        resetChoreForm();
      }
    } catch (err) {
      console.error('Error updating chore:', err);
    }
  };

  const handleDeleteChore = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this chore?')) return;
    try {
      const response = await fetch(`http://localhost:3002/api/chores/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error deleting chore:', err);
    }
  };

  // CRUD Functions for Users
  const handleCreateUser = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      if (response.ok) {
        await fetchData();
        setShowUserModal(false);
        resetUserForm();
      }
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const response = await fetch(`http://localhost:3002/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      if (response.ok) {
        await fetchData();
        setShowUserModal(false);
        setEditingUser(null);
        resetUserForm();
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch(`http://localhost:3002/api/users/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  // Form helpers
  const resetChoreForm = () => {
    setChoreForm({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      due_date: '',
      assigned_user_id: undefined
    });
  };

  const resetUserForm = () => {
    setUserForm({ name: '', email: '' });
  };

  const openChoreModal = (chore?: Chore) => {
    if (chore) {
      setEditingChore(chore);
      setChoreForm({
        title: chore.title,
        description: chore.description,
        priority: chore.priority,
        status: chore.status,
        due_date: chore.due_date.split('T')[0],
        assigned_user_id: chore.assigned_user_id
      });
    } else {
      setEditingChore(null);
      resetChoreForm();
    }
    setShowChoreModal(true);
  };

  const openUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserForm({ name: user.name, email: user.email });
    } else {
      setEditingUser(null);
      resetUserForm();
    }
    setShowUserModal(true);
  };

  // Filter chores based on search and filters
  const filteredChores = chores.filter(chore => {
    const matchesSearch = (chore.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (chore.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesPriority = !filterPriority || chore.priority === filterPriority;
    const matchesStatus = !filterStatus || chore.status === filterStatus;
    const matchesUser = !filterUser || chore.assigned_user_id?.toString() === filterUser;
    
    return matchesSearch && matchesPriority && matchesStatus && matchesUser;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#2ed573';
      case 'in_progress': return '#3742fa';
      case 'pending': return '#747d8c';
      default: return '#747d8c';
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🏠 Household Chores Management</h1>
        <p>Manage your household tasks efficiently</p>
      </header>

      <main className="main-content">
        <div className="dashboard">
          {/* Search and Filter Controls */}
          <div className="controls-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search chores by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filters">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="filter-select"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="filter-select"
              >
                <option value="">All Users</option>
                {users.map(user => (
                  <option key={user.id} value={user.id.toString()}>{user.name}</option>
                ))}
              </select>
            </div>
            <div className="action-buttons">
              <button onClick={() => openChoreModal()} className="btn btn-primary">
                ➕ Add Chore
              </button>
              <button onClick={() => openUserModal()} className="btn btn-secondary">
                👤 Add User
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <div className="stat-number">{users.length}</div>
            </div>
            <div className="stat-card">
              <h3>Total Chores</h3>
              <div className="stat-number">{chores.length}</div>
            </div>
            <div className="stat-card">
              <h3>Completed</h3>
              <div className="stat-number">
                {chores.filter(c => c.status === 'completed').length}
              </div>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <div className="stat-number">
                {chores.filter(c => c.status === 'pending').length}
              </div>
            </div>
          </div>

          <div className="content-grid">
            <div className="section">
              <h2>👥 Users</h2>
              <div className="users-list">
                {users.map(user => (
                  <div key={user.id} className="user-card">
                    <div className="user-info">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>
                    <div className="user-stats">
                      <span className="assigned-count">
                        {chores.filter(c => c.assigned_user_id === user.id).length} assigned
                      </span>
                    </div>
                    <div className="user-actions">
                      <button 
                        onClick={() => openUserModal(user)} 
                        className="btn-icon btn-edit"
                        title="Edit User"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        className="btn-icon btn-delete"
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section">
              <h2>📋 Chores ({filteredChores.length})</h2>
              <div className="chores-list">
                {filteredChores.map(chore => {
                  const assignedUser = users.find(u => u.id === chore.assigned_user_id);
                  return (
                    <div key={chore.id} className="chore-card">
                      <div className="chore-header">
                        <h4>{chore.title}</h4>
                        <div className="chore-badges">
                          <span 
                            className="priority-badge" 
                            style={{ backgroundColor: getPriorityColor(chore.priority) }}
                          >
                            {chore.priority}
                          </span>
                          <span 
                            className="status-badge" 
                            style={{ backgroundColor: getStatusColor(chore.status) }}
                          >
                            {chore.status}
                          </span>
                        </div>
                        <div className="chore-actions">
                          <button 
                            onClick={() => openChoreModal(chore)} 
                            className="btn-icon btn-edit"
                            title="Edit Chore"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDeleteChore(chore.id)} 
                            className="btn-icon btn-delete"
                            title="Delete Chore"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="chore-description">{chore.description}</p>
                      <div className="chore-footer">
                        <span className="due-date">Due: {new Date(chore.due_date).toLocaleDateString()}</span>
                        {assignedUser && (
                          <span className="assigned-to">Assigned to: {assignedUser.name}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredChores.length === 0 && (
                  <div className="no-results">
                    <p>No chores found matching your search criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Chore Modal */}
      {showChoreModal && (
        <div className="modal-overlay" onClick={() => setShowChoreModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingChore ? 'Edit Chore' : 'Add New Chore'}</h3>
              <button onClick={() => setShowChoreModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={choreForm.title}
                  onChange={(e) => setChoreForm({...choreForm, title: e.target.value})}
                  placeholder="Enter chore title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={choreForm.description}
                  onChange={(e) => setChoreForm({...choreForm, description: e.target.value})}
                  placeholder="Enter chore description"
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={choreForm.priority}
                    onChange={(e) => setChoreForm({...choreForm, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={choreForm.status}
                    onChange={(e) => setChoreForm({...choreForm, status: e.target.value as 'pending' | 'in_progress' | 'completed'})}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={choreForm.due_date}
                    onChange={(e) => setChoreForm({...choreForm, due_date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Assign to User</label>
                  <select
                    value={choreForm.assigned_user_id || ''}
                    onChange={(e) => setChoreForm({...choreForm, assigned_user_id: e.target.value ? parseInt(e.target.value) : undefined})}
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowChoreModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={editingChore ? handleUpdateChore : handleCreateChore} 
                className="btn btn-primary"
              >
                {editingChore ? 'Update' : 'Create'} Chore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowUserModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  placeholder="Enter user name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  placeholder="Enter user email"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowUserModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={editingUser ? handleUpdateUser : handleCreateUser} 
                className="btn btn-primary"
              >
                {editingUser ? 'Update' : 'Create'} User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

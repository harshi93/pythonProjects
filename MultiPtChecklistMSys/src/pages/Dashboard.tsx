import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  LinearProgress,
  Alert,
  Fab,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useChecklist } from '../contexts/ChecklistContext';
import { ChecklistForm } from '../components/checklist/ChecklistForm';
import { ChecklistItem } from '../components/checklist/ChecklistItem';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function Dashboard() {
  const {
    activeChecklist,
    deleteChecklist,
    addItem,
  } = useChecklist();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setShowEditForm(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    if (activeChecklist) {
      deleteChecklist(activeChecklist.id);
    }
    setShowDeleteDialog(false);
  };

  const handleAddItem = (text: string, priority?: 'low' | 'medium' | 'high') => {
    if (activeChecklist) {
      addItem(activeChecklist.id, text, priority);
    }
    setShowAddItem(false);
  };

  if (!activeChecklist) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" color="text.secondary" gutterBottom>
          No Checklist Selected
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a checklist from the sidebar or create a new one to get started.
        </Typography>
      </Box>
    );
  }

  const completedItems = activeChecklist.items.filter(item => item.completed).length;
  const totalItems = activeChecklist.items.length;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4" component="h1">
                  {activeChecklist.name}
                </Typography>
                <Chip
                  label={`${completedItems}/${totalItems}`}
                  color={completedItems === totalItems && totalItems > 0 ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>
              
              {activeChecklist.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {activeChecklist.description}
                </Typography>
              )}
              
              {totalItems > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(completionPercentage)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={completionPercentage}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}
            </Box>
            
            <IconButton onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Items */}
      {totalItems === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          This checklist is empty. Add your first item to get started!
        </Alert>
      ) : (
        <Box sx={{ mb: 3 }}>
          {activeChecklist.items.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              checklistId={activeChecklist.id}
            />
          ))}
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add item"
        onClick={() => setShowAddItem(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Checklist
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Checklist
        </MenuItem>
      </Menu>

      {/* Edit Form */}
      <ChecklistForm
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        mode="edit"
        checklist={activeChecklist}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Checklist"
        message={`Are you sure you want to delete "${activeChecklist.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
      />

      {/* Add Item Form */}
      {showAddItem && (
        <ChecklistItem
          checklistId={activeChecklist.id}
          isEditing
          onSave={handleAddItem}
          onCancel={() => setShowAddItem(false)}
        />
      )}
    </Box>
  );
}

export default Dashboard;
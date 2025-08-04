import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  TextField,
  IconButton,
  Typography,
  Chip,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useChecklist } from '../../contexts/ChecklistContext';
import { validateItemText, sanitizeInput } from '../../utils/validation';
import type { ChecklistItem as ChecklistItemType, Priority } from '../../types/checklist';

interface ChecklistItemProps {
  item?: ChecklistItemType;
  checklistId: string;
  isEditing?: boolean;
  onSave?: (text: string, priority?: Priority) => void;
  onCancel?: () => void;
}

const priorityColors = {
  low: 'success',
  medium: 'warning',
  high: 'error',
} as const;

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} as const;

export function ChecklistItem({
  item,
  checklistId,
  isEditing = false,
  onSave,
  onCancel,
}: ChecklistItemProps) {
  const {
    updateItem,
    deleteItem,
    toggleItemCompletion,
  } = useChecklist();
  
  const [editing, setEditing] = useState(isEditing);
  const [text, setText] = useState(item?.text || '');
  const [priority, setPriority] = useState<Priority | undefined>(item?.priority);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setText(item.text);
      setPriority(item.priority);
    }
  }, [item]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setEditing(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (item) {
      deleteItem(checklistId, item.id);
    }
    handleMenuClose();
  };

  const handleSave = () => {
    const textError = validateItemText(text);
    if (textError) {
      setError(textError);
      return;
    }

    const sanitizedText = sanitizeInput(text);
    
    if (item) {
      // Updating existing item
      updateItem(checklistId, item.id, {
        text: sanitizedText,
        priority,
      });
      setEditing(false);
    } else {
      // Creating new item
      onSave?.(sanitizedText, priority);
    }
    
    setError(null);
  };

  const handleCancel = () => {
    if (item) {
      setText(item.text);
      setPriority(item.priority);
      setEditing(false);
    } else {
      onCancel?.();
    }
    setError(null);
  };

  const handleToggleCompletion = () => {
    if (item && !editing) {
      toggleItemCompletion(checklistId, item.id);
    }
  };

  if (editing) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter item text..."
              error={!!error}
              helperText={error}
              autoFocus
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority || ''}
                label="Priority"
                onChange={(e) => setPriority(e.target.value as Priority || undefined)}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                color="inherit"
              >
                Cancel
              </Button>
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSave}
                variant="contained"
                disabled={!text.trim()}
              >
                Save
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!item) return null;

  return (
    <Card
      sx={{
        mb: 2,
        opacity: item.completed ? 0.7 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <CardContent sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Checkbox
            checked={item.completed}
            onChange={handleToggleCompletion}
            sx={{ mt: -1 }}
          />
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                textDecoration: item.completed ? 'line-through' : 'none',
                wordBreak: 'break-word',
              }}
            >
              {item.text}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              {item.priority && (
                <Chip
                  label={priorityLabels[item.priority]}
                  size="small"
                  color={priorityColors[item.priority]}
                  variant="outlined"
                />
              )}
              
              <Typography variant="caption" color="text.secondary">
                {item.createdAt.toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ mt: -1 }}
          >
            <MoreIcon />
          </IconButton>
        </Box>
      </CardContent>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}

export default ChecklistItem;
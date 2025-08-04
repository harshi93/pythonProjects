import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  ChecklistRtl as ChecklistIcon,
  RadioButtonUnchecked as EmptyIcon,
  CheckCircle as CompletedIcon,
} from '@mui/icons-material';
import { useChecklist } from '../../contexts/ChecklistContext';
import { ChecklistForm } from './ChecklistForm';

interface ChecklistSelectorProps {
  onSelect?: () => void;
}

export function ChecklistSelector({ onSelect }: ChecklistSelectorProps) {
  const {
    checklists,
    activeChecklistId,
    setActiveChecklist,
  } = useChecklist();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleSelectChecklist = (id: string) => {
    setActiveChecklist(id);
    onSelect?.();
  };

  const getCompletionStats = (checklistId: string) => {
    const checklist = checklists.find(cl => cl.id === checklistId);
    if (!checklist) return { completed: 0, total: 0 };
    
    const completed = checklist.items.filter(item => item.completed).length;
    const total = checklist.items.length;
    return { completed, total };
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          onClick={() => setShowCreateForm(true)}
          sx={{ mb: 2 }}
        >
          New Checklist
        </Button>
      </Box>
      
      <Divider />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {checklists.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No checklists yet. Create your first one!
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {checklists.map((checklist) => {
              const { completed, total } = getCompletionStats(checklist.id);
              const isActive = checklist.id === activeChecklistId;
              
              return (
                <ListItem key={checklist.id} disablePadding>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => handleSelectChecklist(checklist.id)}
                    sx={{
                      py: 1.5,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {total === 0 ? (
                        <EmptyIcon color={isActive ? 'inherit' : 'action'} />
                      ) : completed === total ? (
                        <CompletedIcon color={isActive ? 'inherit' : 'success'} />
                      ) : (
                        <ChecklistIcon color={isActive ? 'inherit' : 'action'} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? 'inherit' : 'text.primary',
                          }}
                        >
                          {checklist.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={`${completed}/${total}`}
                            size="small"
                            variant={isActive ? 'filled' : 'outlined'}
                            color={completed === total && total > 0 ? 'success' : 'default'}
                            sx={{
                              height: 20,
                              fontSize: '0.75rem',
                              backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : undefined,
                              borderColor: isActive ? 'rgba(255,255,255,0.5)' : undefined,
                            }}
                          />
                          {checklist.description && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: isActive ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 120,
                              }}
                            >
                              {checklist.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
      
      <ChecklistForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        mode="create"
      />
    </Box>
  );
}

export default ChecklistSelector;
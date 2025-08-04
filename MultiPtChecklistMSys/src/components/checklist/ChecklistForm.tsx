import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { useChecklist } from '../../contexts/ChecklistContext';
import { validateChecklistName, validateDescription, sanitizeInput } from '../../utils/validation';
import type { Checklist } from '../../types/checklist';

interface ChecklistFormProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  checklist?: Checklist;
}

export function ChecklistForm({ open, onClose, mode, checklist }: ChecklistFormProps) {
  const { createChecklist, updateChecklist } = useChecklist();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && checklist) {
        setName(checklist.name);
        setDescription(checklist.description || '');
      } else {
        setName('');
        setDescription('');
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open, mode, checklist]);

  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {};
    
    const nameError = validateChecklistName(name);
    if (nameError) newErrors.name = nameError;
    
    const descError = validateDescription(description);
    if (descError) newErrors.description = descError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const sanitizedName = sanitizeInput(name);
      const sanitizedDescription = sanitizeInput(description);
      
      if (mode === 'create') {
        createChecklist(sanitizedName, sanitizedDescription || undefined);
      } else if (mode === 'edit' && checklist) {
        updateChecklist(checklist.id, {
          name: sanitizedName,
          description: sanitizedDescription || undefined,
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving checklist:', error);
      setErrors({ name: 'Failed to save checklist. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>
        {mode === 'create' ? 'Create New Checklist' : 'Edit Checklist'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            autoFocus
            label="Checklist Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 100 }}
          />
          
          <TextField
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!errors.description}
            helperText={errors.description || `${description.length}/500 characters`}
            disabled={isSubmitting}
            inputProps={{ maxLength: 500 }}
          />
          
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Please fix the errors above before submitting.
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || !name.trim()}
        >
          {isSubmitting
            ? (mode === 'create' ? 'Creating...' : 'Saving...')
            : (mode === 'create' ? 'Create' : 'Save')
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChecklistForm;
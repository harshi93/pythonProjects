export const validateChecklistName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Checklist name is required';
  }
  if (name.trim().length < 2) {
    return 'Checklist name must be at least 2 characters long';
  }
  if (name.trim().length > 100) {
    return 'Checklist name must be less than 100 characters';
  }
  return null;
};

export const validateItemText = (text: string): string | null => {
  if (!text.trim()) {
    return 'Item text is required';
  }
  if (text.trim().length < 1) {
    return 'Item text cannot be empty';
  }
  if (text.trim().length > 500) {
    return 'Item text must be less than 500 characters';
  }
  return null;
};

export const validateDescription = (description: string): string | null => {
  if (description && description.length > 500) {
    return 'Description must be less than 500 characters';
  }
  return null;
};

export const isValidPriority = (priority: string): boolean => {
  return ['low', 'medium', 'high'].includes(priority);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};
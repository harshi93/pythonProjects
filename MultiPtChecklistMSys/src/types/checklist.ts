export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface Checklist {
  id: string;
  name: string;
  description?: string;
  items: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistContextType {
  checklists: Checklist[];
  activeChecklistId: string | null;
  activeChecklist: Checklist | null;
  createChecklist: (name: string, description?: string) => void;
  updateChecklist: (id: string, updates: Partial<Checklist>) => void;
  deleteChecklist: (id: string) => void;
  setActiveChecklist: (id: string) => void;
  addItem: (checklistId: string, text: string, priority?: ChecklistItem['priority']) => void;
  updateItem: (checklistId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
  deleteItem: (checklistId: string, itemId: string) => void;
  toggleItemCompletion: (checklistId: string, itemId: string) => void;
}

export type Priority = 'low' | 'medium' | 'high';

export interface CreateChecklistData {
  name: string;
  description?: string;
}

export interface CreateItemData {
  text: string;
  priority?: Priority;
}
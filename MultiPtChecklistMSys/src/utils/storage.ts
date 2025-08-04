import type { Checklist } from '../types/checklist';

const STORAGE_KEY = 'multipoint-checklists';
const ACTIVE_CHECKLIST_KEY = 'active-checklist-id';

export const loadChecklists = (): Checklist[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((checklist: any) => ({
      ...checklist,
      createdAt: new Date(checklist.createdAt),
      updatedAt: new Date(checklist.updatedAt),
      items: checklist.items.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      })),
    }));
  } catch (error) {
    console.error('Error loading checklists from storage:', error);
    return [];
  }
};

export const saveChecklists = (checklists: Checklist[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checklists));
  } catch (error) {
    console.error('Error saving checklists to storage:', error);
  }
};

export const loadActiveChecklistId = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_CHECKLIST_KEY);
  } catch (error) {
    console.error('Error loading active checklist ID:', error);
    return null;
  }
};

export const saveActiveChecklistId = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_CHECKLIST_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_CHECKLIST_KEY);
    }
  } catch (error) {
    console.error('Error saving active checklist ID:', error);
  }
};

export const clearStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_CHECKLIST_KEY);
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};
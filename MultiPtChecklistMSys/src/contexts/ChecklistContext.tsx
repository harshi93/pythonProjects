import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Checklist, ChecklistItem, ChecklistContextType } from '../types/checklist';
import { loadChecklists, saveChecklists, loadActiveChecklistId, saveActiveChecklistId } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

type ChecklistAction =
  | { type: 'LOAD_CHECKLISTS'; payload: Checklist[] }
  | { type: 'SET_ACTIVE_CHECKLIST'; payload: string | null }
  | { type: 'CREATE_CHECKLIST'; payload: { name: string; description?: string } }
  | { type: 'UPDATE_CHECKLIST'; payload: { id: string; updates: Partial<Checklist> } }
  | { type: 'DELETE_CHECKLIST'; payload: string }
  | { type: 'ADD_ITEM'; payload: { checklistId: string; text: string; priority?: ChecklistItem['priority'] } }
  | { type: 'UPDATE_ITEM'; payload: { checklistId: string; itemId: string; updates: Partial<ChecklistItem> } }
  | { type: 'DELETE_ITEM'; payload: { checklistId: string; itemId: string } }
  | { type: 'TOGGLE_ITEM_COMPLETION'; payload: { checklistId: string; itemId: string } };

interface ChecklistState {
  checklists: Checklist[];
  activeChecklistId: string | null;
}

const initialState: ChecklistState = {
  checklists: [],
  activeChecklistId: null,
};

function checklistReducer(state: ChecklistState, action: ChecklistAction): ChecklistState {
  switch (action.type) {
    case 'LOAD_CHECKLISTS':
      return {
        ...state,
        checklists: action.payload,
      };

    case 'SET_ACTIVE_CHECKLIST':
      return {
        ...state,
        activeChecklistId: action.payload,
      };

    case 'CREATE_CHECKLIST': {
      const newChecklist: Checklist = {
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return {
        ...state,
        checklists: [...state.checklists, newChecklist],
        activeChecklistId: newChecklist.id,
      };
    }

    case 'UPDATE_CHECKLIST': {
      const updatedChecklists = state.checklists.map(checklist =>
        checklist.id === action.payload.id
          ? { ...checklist, ...action.payload.updates, updatedAt: new Date() }
          : checklist
      );
      return {
        ...state,
        checklists: updatedChecklists,
      };
    }

    case 'DELETE_CHECKLIST': {
      const filteredChecklists = state.checklists.filter(checklist => checklist.id !== action.payload);
      const newActiveId = state.activeChecklistId === action.payload
        ? (filteredChecklists.length > 0 ? filteredChecklists[0].id : null)
        : state.activeChecklistId;
      return {
        ...state,
        checklists: filteredChecklists,
        activeChecklistId: newActiveId,
      };
    }

    case 'ADD_ITEM': {
      const newItem: ChecklistItem = {
        id: uuidv4(),
        text: action.payload.text,
        completed: false,
        priority: action.payload.priority,
        createdAt: new Date(),
      };
      const updatedChecklists = state.checklists.map(checklist =>
        checklist.id === action.payload.checklistId
          ? {
              ...checklist,
              items: [...checklist.items, newItem],
              updatedAt: new Date(),
            }
          : checklist
      );
      return {
        ...state,
        checklists: updatedChecklists,
      };
    }

    case 'UPDATE_ITEM': {
      const updatedChecklists = state.checklists.map(checklist =>
        checklist.id === action.payload.checklistId
          ? {
              ...checklist,
              items: checklist.items.map(item =>
                item.id === action.payload.itemId
                  ? { ...item, ...action.payload.updates }
                  : item
              ),
              updatedAt: new Date(),
            }
          : checklist
      );
      return {
        ...state,
        checklists: updatedChecklists,
      };
    }

    case 'DELETE_ITEM': {
      const updatedChecklists = state.checklists.map(checklist =>
        checklist.id === action.payload.checklistId
          ? {
              ...checklist,
              items: checklist.items.filter(item => item.id !== action.payload.itemId),
              updatedAt: new Date(),
            }
          : checklist
      );
      return {
        ...state,
        checklists: updatedChecklists,
      };
    }

    case 'TOGGLE_ITEM_COMPLETION': {
      const updatedChecklists = state.checklists.map(checklist =>
        checklist.id === action.payload.checklistId
          ? {
              ...checklist,
              items: checklist.items.map(item =>
                item.id === action.payload.itemId
                  ? { ...item, completed: !item.completed }
                  : item
              ),
              updatedAt: new Date(),
            }
          : checklist
      );
      return {
        ...state,
        checklists: updatedChecklists,
      };
    }

    default:
      return state;
  }
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(checklistReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedChecklists = loadChecklists();
    const savedActiveId = loadActiveChecklistId();
    
    dispatch({ type: 'LOAD_CHECKLISTS', payload: savedChecklists });
    
    if (savedActiveId && savedChecklists.some(cl => cl.id === savedActiveId)) {
      dispatch({ type: 'SET_ACTIVE_CHECKLIST', payload: savedActiveId });
    } else if (savedChecklists.length > 0) {
      dispatch({ type: 'SET_ACTIVE_CHECKLIST', payload: savedChecklists[0].id });
    }
  }, []);

  // Save to localStorage whenever checklists change
  useEffect(() => {
    if (state.checklists.length > 0) {
      saveChecklists(state.checklists);
    }
  }, [state.checklists]);

  // Save active checklist ID whenever it changes
  useEffect(() => {
    saveActiveChecklistId(state.activeChecklistId);
  }, [state.activeChecklistId]);

  const activeChecklist = state.checklists.find(cl => cl.id === state.activeChecklistId) || null;

  const contextValue: ChecklistContextType = {
    checklists: state.checklists,
    activeChecklistId: state.activeChecklistId,
    activeChecklist,
    createChecklist: (name: string, description?: string) => {
      dispatch({ type: 'CREATE_CHECKLIST', payload: { name, description } });
    },
    updateChecklist: (id: string, updates: Partial<Checklist>) => {
      dispatch({ type: 'UPDATE_CHECKLIST', payload: { id, updates } });
    },
    deleteChecklist: (id: string) => {
      dispatch({ type: 'DELETE_CHECKLIST', payload: id });
    },
    setActiveChecklist: (id: string) => {
      dispatch({ type: 'SET_ACTIVE_CHECKLIST', payload: id });
    },
    addItem: (checklistId: string, text: string, priority?: ChecklistItem['priority']) => {
      dispatch({ type: 'ADD_ITEM', payload: { checklistId, text, priority } });
    },
    updateItem: (checklistId: string, itemId: string, updates: Partial<ChecklistItem>) => {
      dispatch({ type: 'UPDATE_ITEM', payload: { checklistId, itemId, updates } });
    },
    deleteItem: (checklistId: string, itemId: string) => {
      dispatch({ type: 'DELETE_ITEM', payload: { checklistId, itemId } });
    },
    toggleItemCompletion: (checklistId: string, itemId: string) => {
      dispatch({ type: 'TOGGLE_ITEM_COMPLETION', payload: { checklistId, itemId } });
    },
  };

  return (
    <ChecklistContext.Provider value={contextValue}>
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklist() {
  const context = useContext(ChecklistContext);
  if (context === undefined) {
    throw new Error('useChecklist must be used within a ChecklistProvider');
  }
  return context;
}

export default ChecklistContext;
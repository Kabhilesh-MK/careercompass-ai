import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { StudentState, AppStateAction } from '@/types/appState';
import { appStateReducer } from './AppStateReducer';
import { loadState, saveState, clearState, getInitialState } from '@/services/persistence/storage';

export interface AppStateContextValue {
  state: StudentState;
  dispatch: React.Dispatch<AppStateAction>;
  resetDemoData: () => void;
  isLoaded: boolean;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const [state, dispatch] = useReducer(appStateReducer, undefined, () => {
    const persisted = loadState();
    return persisted || getInitialState();
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Save to persistent storage on state change
  useEffect(() => {
    if (isLoaded) {
      saveState(state);
    }
  }, [state, isLoaded]);

  const resetDemoData = useCallback(() => {
    clearState();
    dispatch({ type: 'RESET_DEMO_DATA' });
  }, []);

  return (
    <AppStateContext.Provider value={{ state, dispatch, resetDemoData, isLoaded }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppStateContext(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppStateContext must be used within an AppStateProvider');
  }
  return context;
}

export const useAppState = useAppStateContext;

import { useAppStateContext } from '@/context/AppStateContext';

export function useAppState() {
  return useAppStateContext();
}

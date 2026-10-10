import { NotificationItemData } from '@/types/careerCompass';
import { loadState, getInitialState } from '@/services/persistence/storage';

/**
 * Notifications API Service
 * Handles notification retrieval and read status updates.
 */
export async function getNotifications(): Promise<NotificationItemData[]> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  const state = loadState() || getInitialState();
  return JSON.parse(JSON.stringify(state.notifications));
}

export async function markNotificationRead(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 15));
}

export async function markAllNotificationsRead(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 15));
}

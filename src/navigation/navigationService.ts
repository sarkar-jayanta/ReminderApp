import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../types/reminder';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();
let pendingReminderId: string | null = null;

export function openReminderFromNotification(reminderId: string): void {
  if (!navigationRef.isReady()) {
    pendingReminderId = reminderId;
    return;
  }
  const currentRoute = navigationRef.getCurrentRoute();
  if (currentRoute?.name === 'ReminderDetails' && currentRoute.params?.reminderId === reminderId) {
    return;
  }
  navigationRef.navigate('ReminderDetails', { reminderId });
}

export function processPendingNotificationNavigation(): void {
  if (pendingReminderId && navigationRef.isReady()) {
    const reminderId = pendingReminderId;
    pendingReminderId = null;
    navigationRef.navigate('ReminderDetails', { reminderId });
  }
}

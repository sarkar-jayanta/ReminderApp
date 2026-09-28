import notifee, {
  AlarmType,
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  EventType,
  TriggerType,
  type Event,
} from '@notifee/react-native';
import { Linking, Platform } from 'react-native';
import type { Reminder } from '../types/reminder';

const REMINDER_CHANNEL_ID = 'reminders';

export interface NotificationScheduleResult {
  notificationId: string | null;
  permissionGranted: boolean;
}

function getReminderId(event: Event): string | null {
  const reminderId = event.detail.notification?.data?.reminderId;
  return typeof reminderId === 'string' ? reminderId : null;
}

export async function initializeNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: 'Reminders',
      description: 'Scheduled reminder alerts',
      importance: AndroidImportance.HIGH,
      vibration: true,
    });
  }
}

export async function hasNotificationPermission(): Promise<boolean> {
  const settings = await notifee.getNotificationSettings();
  return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED
    || settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
}

export async function hasExactAlarmPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  const settings = await notifee.getNotificationSettings();
  return settings.android.alarm === AndroidNotificationSetting.ENABLED;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED
    || settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
}

export async function scheduleReminderNotification(
  reminder: Reminder,
  requestPermission = true,
): Promise<NotificationScheduleResult> {
  const permissionGranted = requestPermission
    ? await requestNotificationPermission()
    : await hasNotificationPermission();

  if (!permissionGranted) {
    return { notificationId: null, permissionGranted: false };
  }

  await initializeNotifications();
  const exactAlarmAllowed = await hasExactAlarmPermission();
  const notificationId = await notifee.createTriggerNotification(
    {
      title: reminder.title,
      body: 'Your reminder is due now.',
      data: { reminderId: reminder.id },
      android: {
        channelId: REMINDER_CHANNEL_ID,
        pressAction: { id: 'default' },
        smallIcon: 'ic_notification',
        ...(Platform.OS === 'android' ? { autoCancel: true } : {}),
      },
      ios: {
        foregroundPresentationOptions: {
          alert: true,
          badge: true,
          sound: true,
        },
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: new Date(reminder.dateTime).getTime(),
      ...(Platform.OS === 'android' && exactAlarmAllowed
        ? { alarmManager: { type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE } }
        : {}),
    },
  );

  return { notificationId, permissionGranted: true };
}

export async function cancelReminderNotification(notificationId?: string): Promise<void> {
  if (notificationId) {
    await notifee.cancelNotification(notificationId);
  }
}

export async function openNotificationSettings(): Promise<void> {
  if (Platform.OS === 'ios') {
    await Linking.openSettings();
    return;
  }
  await notifee.openNotificationSettings();
}

export async function openExactAlarmSettings(): Promise<void> {
  await notifee.openAlarmPermissionSettings();
}

export function subscribeToNotificationPress(
  onReminderPress: (reminderId: string) => void,
): () => void {
  return notifee.onForegroundEvent(event => {
    if (event.type === EventType.PRESS) {
      const reminderId = getReminderId(event);
      if (reminderId) {
        onReminderPress(reminderId);
      }
    }
  });
}

export async function getInitialNotificationReminderId(): Promise<string | null> {
  const initialNotification = await notifee.getInitialNotification();
  const reminderId = initialNotification?.notification.data?.reminderId;
  return typeof reminderId === 'string' ? reminderId : null;
}

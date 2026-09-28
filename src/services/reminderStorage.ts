import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Reminder } from '../types/reminder';

const REMINDERS_STORAGE_KEY = '@reminder-app/reminders-v1';

function isReminder(value: unknown): value is Reminder {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const reminder = value as Record<string, unknown>;
  return typeof reminder.id === 'string'
    && typeof reminder.title === 'string'
    && typeof reminder.dateTime === 'string'
    && typeof reminder.completed === 'boolean'
    && (reminder.notificationId === undefined || typeof reminder.notificationId === 'string');
}

export async function getReminders(): Promise<Reminder[]> {
  const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
  if (!stored) {
    return [];
  }

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed) || !parsed.every(isReminder)) {
    throw new Error('Saved reminders are invalid or corrupted.');
  }
  return parsed;
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
}

export async function getReminderById(id: string): Promise<Reminder | undefined> {
  return (await getReminders()).find(reminder => reminder.id === id);
}

export async function saveReminder(reminder: Reminder): Promise<void> {
  const reminders = await getReminders();
  await saveReminders([reminder, ...reminders.filter(item => item.id !== reminder.id)]);
}

export async function updateReminder(reminder: Reminder): Promise<void> {
  const reminders = await getReminders();
  if (!reminders.some(item => item.id === reminder.id)) {
    throw new Error('The reminder no longer exists.');
  }
  await saveReminders(reminders.map(item => item.id === reminder.id ? reminder : item));
}

export async function deleteReminder(id: string): Promise<void> {
  const reminders = await getReminders();
  await saveReminders(reminders.filter(reminder => reminder.id !== id));
}

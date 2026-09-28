import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  cancelReminderNotification,
  hasExactAlarmPermission,
  hasNotificationPermission,
  initializeNotifications,
  scheduleReminderNotification,
} from '../services/notificationService';
import * as reminderStorage from '../services/reminderStorage';
import type { Reminder } from '../types/reminder';
import { createReminderId, validateReminder } from '../utils/validation';

interface RemindersContextValue {
  reminders: Reminder[];
  isLoading: boolean;
  isSaving: boolean;
  loadError: string | null;
  actionError: string | null;
  notificationMessage: string | null;
  notificationsEnabled: boolean | null;
  exactAlarmsEnabled: boolean | null;
  refresh: () => Promise<void>;
  save: (values: { title: string; dateTime: Date; reminderId?: string }) => Promise<boolean>;
  remove: (reminderId: string) => Promise<void>;
  setCompleted: (reminderId: string, completed: boolean) => Promise<void>;
  clearMessages: () => void;
}

const RemindersContext = createContext<RemindersContextValue | null>(null);

export const RemindersProvider = ({ children }: React.PropsWithChildren) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean | null>(null);
  const [exactAlarmsEnabled, setExactAlarmsEnabled] = useState<boolean | null>(null);
  const savingRef = useRef(false);

  const refreshNotificationPermissions = useCallback(async () => {
    try {
      const [notificationsAllowed, exactAlarmsAllowed] = await Promise.all([
        hasNotificationPermission(),
        hasExactAlarmPermission(),
      ]);
      setNotificationsEnabled(notificationsAllowed);
      setExactAlarmsEnabled(exactAlarmsAllowed);
    } catch (error) {
      console.error('Failed to refresh notification permissions:', error);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const saved = await reminderStorage.getReminders();
      setReminders(saved.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()));
    } catch (error) {
      console.error('Failed to load reminders:', error);
      setLoadError('Your reminders could not be loaded. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(error => console.error('Failed to refresh reminders:', error));
    initializeNotifications().catch(error => {
      console.error('Failed to initialize notifications:', error);
    });
    refreshNotificationPermissions().catch(error => console.error('Failed to refresh notification permissions:', error));
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refreshNotificationPermissions().catch(error => console.error('Failed to refresh notification permissions:', error));
      }
    });
    return () => subscription.remove();
  }, [refresh, refreshNotificationPermissions]);

  const save = useCallback(async ({ title, dateTime, reminderId }: {
    title: string;
    dateTime: Date;
    reminderId?: string;
  }): Promise<boolean> => {
    if (savingRef.current) {
      return false;
    }
    const validationError = validateReminder(title, dateTime);
    if (validationError) {
      setActionError(validationError);
      return false;
    }

  savingRef.current = true;
    setIsSaving(true);
    setActionError(null);
    setNotificationMessage(null);
    let newlyScheduledNotificationId: string | undefined;
    try {
      const existing = reminderId ? await reminderStorage.getReminderById(reminderId) : undefined;
      if (reminderId && !existing) {
        throw new Error('This reminder could not be found.');
      }

      if (existing?.notificationId) {
        await cancelReminderNotification(existing.notificationId);
      }

      const updated: Reminder = {
        id: existing?.id ?? createReminderId(),
        title: title.trim(),
        dateTime: dateTime.toISOString(),
        completed: existing?.completed ?? false,
      };

      await reminderStorage.saveReminder(updated);
      let reminderToStore = updated;
      if (!updated.completed) {
        let result;
        try {
          result = await scheduleReminderNotification(updated);
          setNotificationsEnabled(result.permissionGranted);
          hasExactAlarmPermission().then(setExactAlarmsEnabled).catch(error => {
            console.error('Failed to refresh exact alarm permission:', error);
          });
        } catch (error) {
          console.error('Failed to schedule reminder notification:', error);
          setNotificationMessage('Reminder saved, but its notification could not be scheduled. You can still find it in your list.');
        }
        if (result?.notificationId) {
          newlyScheduledNotificationId = result.notificationId;
          reminderToStore = { ...updated, notificationId: result.notificationId };
          await reminderStorage.updateReminder(reminderToStore);
        } else if (result && !result.permissionGranted) {
          setNotificationMessage('Reminder saved, but notifications are off. Enable them in device settings to receive alerts.');
        }
      }

      setReminders(current => {
        const next = [reminderToStore, ...current.filter(item => item.id !== reminderToStore.id)];
        return next.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      });
      return true;
    } catch (error) {
      if (newlyScheduledNotificationId) {
        try {
          await cancelReminderNotification(newlyScheduledNotificationId);
        } catch (cancelError) {
          console.error('Failed to cancel notification after reminder save failed:', cancelError);
        }
      }
      console.error('Failed to save reminder:', error);
      setActionError('Your reminder could not be saved. Please try again.');
      return false;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }, []);

  const remove = useCallback(async (reminderId: string) => {
    setActionError(null);
    const reminder = reminders.find(item => item.id === reminderId);
    if (!reminder) {
      return;
    }
    try {
      await cancelReminderNotification(reminder.notificationId);
      await reminderStorage.deleteReminder(reminderId);
      setReminders(current => current.filter(item => item.id !== reminderId));
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      setActionError('The reminder could not be deleted. Please try again.');
      throw error;
    }
  }, [reminders]);

  const setCompleted = useCallback(async (reminderId: string, completed: boolean) => {
    setActionError(null);
    const reminder = reminders.find(item => item.id === reminderId);
    if (!reminder) {
      throw new Error('This reminder could not be found.');
    }
    if (!completed && new Date(reminder.dateTime).getTime() <= Date.now()) {
      setActionError('A reminder must be in the future to be marked pending.');
      return;
    }
    let newlyScheduledNotificationId: string | undefined;
    try {
      if (completed) {
        await cancelReminderNotification(reminder.notificationId);
      }
      let updated: Reminder = {
        ...reminder,
        completed,
        notificationId: completed ? undefined : reminder.notificationId,
      };
      if (!completed) {
        try {
          const result = await scheduleReminderNotification(updated);
          setNotificationsEnabled(result.permissionGranted);
          if (result.notificationId) {
            newlyScheduledNotificationId = result.notificationId;
            updated = { ...updated, notificationId: result.notificationId };
          } else {
            setNotificationMessage('Reminder marked as pending, but notifications are off. Enable them in device settings to receive alerts.');
          }
        } catch (error) {
          console.error('Failed to schedule reopened reminder:', error);
          setNotificationMessage('Reminder marked as pending, but its notification could not be scheduled.');
        }
      }
      await reminderStorage.updateReminder(updated);
      setReminders(current => current.map(item => item.id === reminderId ? updated : item));
    } catch (error) {
      if (newlyScheduledNotificationId) {
        try {
          await cancelReminderNotification(newlyScheduledNotificationId);
        } catch (cancelError) {
          console.error('Failed to cancel reminder notification after status update failed:', cancelError);
        }
      }
      console.error('Failed to update reminder status:', error);
      setActionError(error instanceof Error && error.message.includes('future')
        ? error.message
        : 'The reminder could not be updated. Please try again.');
      throw error;
    }
  }, [reminders]);

  const clearMessages = useCallback(() => {
    setActionError(null);
    setNotificationMessage(null);
  }, []);

  const value = useMemo(() => ({
    reminders,
    isLoading,
    isSaving,
    loadError,
    actionError,
    notificationMessage,
    notificationsEnabled,
    exactAlarmsEnabled,
    refresh,
    save,
    remove,
    setCompleted,
    clearMessages,
  }), [reminders, isLoading, isSaving, loadError, actionError, notificationMessage, notificationsEnabled, exactAlarmsEnabled, refresh, save, remove, setCompleted, clearMessages]);

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders(): RemindersContextValue {
  const context = useContext(RemindersContext);
  if (!context) {
    throw new Error('useReminders must be used within RemindersProvider.');
  }
  return context;
}

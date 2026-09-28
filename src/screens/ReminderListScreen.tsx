import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { MessageBanner } from '../components/MessageBanner';
import { ReminderItem } from '../components/ReminderItem';
import { useReminders } from '../hooks/RemindersContext';
import {
  openExactAlarmSettings,
  openNotificationSettings,
} from '../services/notificationService';
import { getTheme } from '../theme/theme';
import type { Reminder, RootStackParamList } from '../types/reminder';
import { formatReminderDate } from '../utils/dateUtils';

export const ReminderListScreen = () => {
  const theme = getTheme(useColorScheme() ?? 'light');

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    reminders,
    isLoading,
    loadError,
    actionError,
    notificationMessage,
    notificationsEnabled,
    exactAlarmsEnabled,
    refresh,
    remove,
    setCompleted,
  } = useReminders();

  const sortedReminders = [...reminders].sort(
    (a, b) =>
      new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
  );

  const groups: Record<string, Reminder[]> = {};

  sortedReminders.forEach(reminder => {
    const date = new Date(reminder.dateTime).toLocaleDateString();

    if (!groups[date]) {
      groups[date] = [];
    }

    groups[date].push(reminder);
  });

  const pendingCount = reminders.filter(reminder => !reminder.completed).length;

  const todayCount = reminders.filter(reminder => {
    if (reminder.completed) {
      return false;
    }

    return (
      new Date(reminder.dateTime).toDateString() === new Date().toDateString()
    );
  }).length;

  const completedCount = reminders.filter(
    reminder => reminder.completed,
  ).length;

  const deleteReminder = (reminder: Reminder) => {
    Alert.alert(
      'Delete reminder?',
      `"${reminder.title}" will be removed.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => remove(reminder.id),
        },
      ],
    );
  };

  const retry = () => {
    refresh();
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.eyebrowPill,
              { backgroundColor: `${theme.primary}20` },
            ]}
          >
            <Text style={[styles.eyebrow, { color: theme.primary }]}>
              YOUR DAY, IN GOOD HANDS
            </Text>
          </View>

          <Text style={[styles.heading, { color: theme.text }]}>
            Reminders
          </Text>

          <Text style={[styles.description, { color: theme.muted }]}>
            {reminders.length === 1
              ? '1 reminder to keep in mind'
              : `${reminders.length} reminders to keep in mind`}
          </Text>
        </View>

        {!isLoading && !loadError && reminders.length > 0 && (
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: `${theme.primary}18` },
              ]}
            >
              <Text style={[styles.statValue, { color: theme.primary }]}>
                {pendingCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.muted }]}>
                Pending
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text style={[styles.statValue, { color: '#fff' }]}>
                {todayCount}
              </Text>
              <Text style={[styles.statLabel, { color: '#ffffffcc' }]}>
                Today
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: `${theme.muted}18` },
              ]}
            >
              <Text style={[styles.statValue, { color: theme.text }]}>
                {completedCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.muted }]}>
                Done
              </Text>
            </View>
          </View>
        )}

        {notificationsEnabled === false && (
          <Pressable
            onPress={openNotificationSettings}
            style={({ pressed }) => [
              styles.banner,
              pressed && styles.pressed,
            ]}
          >
            <MessageBanner
              theme={theme}
              message="Notifications are off. Reminders will still be saved. Tap here to review notification settings."
            />
          </Pressable>
        )}

        {notificationsEnabled &&
          Platform.OS === 'android' &&
          exactAlarmsEnabled === false && (
            <Pressable
              onPress={openExactAlarmSettings}
              style={({ pressed }) => [
                styles.banner,
                pressed && styles.pressed,
              ]}
            >
              <MessageBanner
                theme={theme}
                message="Exact alarms are off, so some reminders may arrive late. Tap here to allow precise alarms in device settings."
              />
            </Pressable>
          )}

        {notificationMessage && (
          <View style={styles.banner}>
            <MessageBanner
              theme={theme}
              message={notificationMessage}
            />
          </View>
        )}

        {actionError && (
          <View style={styles.banner}>
            <MessageBanner
              theme={theme}
              tone="error"
              message={actionError}
            />
          </View>
        )}

        {isLoading ? (
          <LoadingState theme={theme} />
        ) : loadError ? (
          <ErrorState
            theme={theme}
            message={loadError}
            onRetry={retry}
          />
        ) : reminders.length === 0 ? (
          <EmptyState theme={theme} />
        ) : (
          Object.entries(groups).map(([date, items]) => (
            <View key={date} style={styles.group}>
              <View style={styles.groupHeader}>
                <View
                  style={[
                    styles.groupDot,
                    { backgroundColor: theme.primary },
                  ]}
                />

                <Text
                  style={[
                    styles.groupHeading,
                    { color: theme.text },
                  ]}
                >
                  {formatReminderDate(items[0].dateTime)}
                </Text>

                <View
                  style={[
                    styles.groupLine,
                    { backgroundColor: `${theme.muted}33` },
                  ]}
                />

                <View
                  style={[
                    styles.groupBadge,
                    { backgroundColor: `${theme.primary}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.groupBadgeText,
                      { color: theme.primary },
                    ]}
                  >
                    {items.length}
                  </Text>
                </View>
              </View>

              {items.map(reminder => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  theme={theme}
                  onPress={() =>
                    navigation.navigate('ReminderDetails', {
                      reminderId: reminder.id,
                    })
                  }
                  onToggle={() =>
                    setCompleted(reminder.id, !reminder.completed)
                  }
                  onDelete={() => deleteReminder(reminder)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Pressable
        onPress={() => navigation.navigate('ReminderForm')}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.primary,
            shadowColor: theme.primary,
          },
          pressed && styles.fabPressed,
        ]}
      >
        <Text style={styles.fabIcon}>＋</Text>
        <Text style={styles.fabText}>New reminder</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 120,
  },

  header: {
    marginBottom: 22,
  },

  eyebrowPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 12,
  },

  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.25,
    fontWeight: '800',
  },

  heading: {
    fontSize: 36,
    letterSpacing: -1,
    fontWeight: '800',
  },

  description: {
    fontSize: 14,
    marginTop: 6,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },

  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
  },

  statValue: {
    fontSize: 26,
    fontWeight: '800',
  },

  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },

  banner: {
    marginBottom: 4,
  },

  pressed: {
    opacity: 0.75,
  },

  group: {
    marginTop: 10,
    marginBottom: 14,
  },

  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 3,
  },

  groupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 9,
  },

  groupHeading: {
    fontSize: 14,
    fontWeight: '700',
  },

  groupLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth * 2,
    marginHorizontal: 12,
  },

  groupBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  groupBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },

  fab: {
    position: 'absolute',
    right: 22,
    bottom: 26,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 28,
    elevation: 8,
  },

  fabPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.92,
  },

  fabIcon: {
    color: '#fff',
    fontSize: 24,
    marginRight: 8,
  },

  fabText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
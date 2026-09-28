import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { LoadingState } from '../components/LoadingState';
import { MessageBanner } from '../components/MessageBanner';
import { useReminders } from '../hooks/RemindersContext';
import { getTheme } from '../theme/theme';
import type { RootStackParamList } from '../types/reminder';
import { formatReminderDateTime } from '../utils/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'ReminderDetails'>;

export const ReminderDetailsScreen = ({ navigation, route }: Props) => {
  const theme = getTheme(useColorScheme() ?? 'light');
  const { reminders, isLoading, actionError, setCompleted, remove } =
    useReminders();

  const [isUpdating, setIsUpdating] = useState(false);

  const reminder = reminders.find(
    item => item.id === route.params.reminderId,
  );

  const deleteReminder = () => {
    Alert.alert(
      'Delete reminder?',
      'This reminder and its scheduled notification will be removed.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await remove(route.params.reminderId);
            navigation.popToTop();
          },
        },
      ],
    );
  };

  const toggleCompleted = async () => {
    if (!reminder) return;

    setIsUpdating(true);

    try {
      await setCompleted(reminder.id, !reminder.completed);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.screen,
          { backgroundColor: theme.background },
        ]}
      >
        <LoadingState theme={theme} />
      </View>
    );
  }

  if (!reminder) {
    return (
      <View
        style={[
          styles.screen,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Reminder unavailable
        </Text>

        <Text style={[styles.copy, { color: theme.muted }]}>
          This reminder may have been deleted.
        </Text>

        <Pressable
          onPress={() => navigation.popToTop()}
          style={[
            styles.button,
            { backgroundColor: theme.primary },
          ]}
        >
          <Text style={styles.buttonText}>Back to reminders</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.background },
      ]}
    >
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[
            styles.backButton,
            { backgroundColor: theme.surface },
          ]}
        >
          <Text style={[styles.backText, { color: theme.text }]}>
            ‹
          </Text>
        </Pressable>

        <Text style={[styles.topTitle, { color: theme.text }]}>
          Reminder details
        </Text>

        <View style={styles.topSpacer} />
      </View>

      <View style={styles.content}>
        {actionError && (
          <MessageBanner
            theme={theme}
            tone="error"
            message={actionError}
          />
        )}

        <View
          style={[
            styles.icon,
            { backgroundColor: theme.surfaceMuted },
          ]}
        >
          {reminder.completed ? (
            <Image
              source={require('../assets/check.png')}
              style={styles.checkmark}
            />
          ) : (
            <Image
              source={require('../assets/time.png')}
              style={[
                styles.clock,
                { tintColor: theme.primary },
              ]}
            />
          )}
        </View>

        <Text
          style={[
            styles.title,
            { color: theme.text },
            reminder.completed && styles.completedTitle,
          ]}
        >
          {reminder.title}
        </Text>

        <Text style={[styles.copy, { color: theme.muted }]}>
          {formatReminderDateTime(reminder.dateTime)}
        </Text>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: reminder.completed
                ? theme.surfaceMuted
                : theme.surface,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: reminder.completed
                  ? theme.success
                  : theme.primary,
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: reminder.completed
                  ? theme.success
                  : theme.text,
              },
            ]}
          >
            {reminder.completed ? 'Completed' : 'Pending'}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={toggleCompleted}
            disabled={isUpdating}
            style={[
              styles.button,
              { backgroundColor: theme.primary },
              isUpdating && styles.disabledButton,
            ]}
          >
            <Text style={styles.buttonText}>
              {isUpdating
                ? 'Updating...'
                : reminder.completed
                ? 'Mark as pending'
                : 'Mark completed'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              navigation.navigate('ReminderForm', {
                reminderId: reminder.id,
              })
            }
            style={[
              styles.button,
              styles.secondaryButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                { color: theme.text },
              ]}
            >
              Edit reminder
            </Text>
          </Pressable>

          <Pressable
            onPress={deleteReminder}
            style={styles.deleteButton}
          >
            <Text
              style={[
                styles.deleteText,
                { color: theme.danger },
              ]}
            >
              Delete reminder
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },

  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },

  backText: {
    fontSize: 31,
  },

  topTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  topSpacer: {
    width: 42,
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 46,
  },

  icon: {
    width: 78,
    height: 78,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  checkmark: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    tintColor: '#005b18',
  },

  clock: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },

  title: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '700',
    textAlign: 'center',
  },

  completedTitle: {
    textDecorationLine: 'line-through',
  },

  copy: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 10,
  },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 22,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
  },

  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },

  actions: {
    width: '100%',
    marginTop: 44,
  },

  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 18,
    marginBottom: 11,
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.6,
  },

  secondaryButton: {
    borderWidth: 1,
  },

  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },

  deleteButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
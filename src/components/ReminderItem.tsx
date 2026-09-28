import React, { useRef } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Reminder } from '../types/reminder';
import type { AppTheme } from '../theme/theme';
import { formatReminderTime } from '../utils/dateUtils';

interface ReminderItemProps {
  reminder: Reminder;
  theme: AppTheme;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

const ACTION_WIDTH = 88;
const MAX_DRAG = ACTION_WIDTH + 16;

export const ReminderItem = ({
  reminder,
  theme,
  onPress,
  onToggle,
  onDelete,
}: ReminderItemProps) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const restingX = useRef(0); // 0 = closed, -ACTION_WIDTH = open

  const snapTo = (toValue: number) => {
    restingX.current = toValue;
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        const next = Math.min(
          0,
          Math.max(-MAX_DRAG, restingX.current + g.dx),
        );
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const end = restingX.current + g.dx;
        if (g.vx < -0.5) {
          snapTo(-ACTION_WIDTH);
        } else if (g.vx > 0.5) {
          snapTo(0);
        } else {
          snapTo(end < -ACTION_WIDTH / 2 ? -ACTION_WIDTH : 0);
        }
      },
      onPanResponderTerminate: () => snapTo(restingX.current),
    }),
  ).current;

  // While a row is open, any tap on it just closes it.
  const whenClosed = (action: () => void) => () => {
    if (restingX.current !== 0) {
      snapTo(0);
      return;
    }
    action();
  };

  const handleDelete = () => {
    snapTo(0);
    onDelete();
  };

  const actionOpacity = translateX.interpolate({
    inputRange: [-20, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.action,
          { backgroundColor: theme.danger, opacity: actionOpacity },
        ]}
      >
        <Pressable
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${reminder.title}`}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>Delete</Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            transform: [{ translateX }],
          },
        ]}
      >
        <Pressable
          onPress={whenClosed(onToggle)}
          style={[
            styles.check,
            {
              borderColor: reminder.completed
                ? theme.success
                : theme.border,
              backgroundColor: reminder.completed
                ? theme.success
                : 'transparent',
            },
          ]}
        >
          {reminder.completed && (
            <Image
              source={require('../assets/check.png')}
              style={styles.checkmark}
            />
          )}
        </Pressable>

        <Pressable onPress={whenClosed(onPress)} style={styles.content}>
          <Text
            numberOfLines={2}
            style={[
              styles.title,
              {
                color: reminder.completed
                  ? theme.muted
                  : theme.text,
              },
              reminder.completed && styles.completedTitle,
            ]}
          >
            {reminder.title}
          </Text>

          <Text style={[styles.subtitle, { color: theme.muted }]}>
            {formatReminderTime(reminder.dateTime)}
          </Text>
        </Pressable>

        <View style={styles.right}>
          <Text
            style={[
              styles.status,
              {
                color: reminder.completed
                  ? theme.success
                  : theme.muted,
              },
            ]}
          >
            {reminder.completed ? 'Done' : 'Pending'}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },

  action: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    borderRadius: 18,
  },

  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  card: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },

  check: {
    width: 23,
    height: 23,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  checkmark: {
    width: 15,
    height: 15,
    tintColor: '#FFFFFF',
  },

  content: {
    flex: 1,
    paddingRight: 8,
  },

  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },

  completedTitle: {
    textDecorationLine: 'line-through',
  },

  subtitle: {
    fontSize: 13,
    marginTop: 5,
  },

  right: {
    alignItems: 'flex-end',
  },

  status: {
    fontSize: 12,
    fontWeight: '600',
  },
});
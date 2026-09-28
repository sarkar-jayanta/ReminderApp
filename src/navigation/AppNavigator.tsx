import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { ReminderDetailsScreen } from '../screens/ReminderDetailsScreen';
import { ReminderFormScreen } from '../screens/ReminderFormScreen';
import { ReminderListScreen } from '../screens/ReminderListScreen';
import { getInitialNotificationReminderId, subscribeToNotificationPress } from '../services/notificationService';
import { navigationRef, openReminderFromNotification, processPendingNotificationNavigation } from './navigationService';
import type { RootStackParamList } from '../types/reminder';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const colorScheme = useColorScheme();

  useEffect(() => subscribeToNotificationPress(openReminderFromNotification), []);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
      onReady={() => {
        processPendingNotificationNavigation();
        getInitialNotificationReminderId()
          .then(reminderId => { if (reminderId) openReminderFromNotification(reminderId); })
          .catch(error => console.error('Failed to read the notification that opened the app:', error));
      }}
    >
      <Stack.Navigator initialRouteName="ReminderList" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="ReminderList" component={ReminderListScreen} />
        <Stack.Screen name="ReminderForm" component={ReminderFormScreen} />
        <Stack.Screen name="ReminderDetails" component={ReminderDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

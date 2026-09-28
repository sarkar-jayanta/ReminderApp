export interface Reminder {
  id: string;
  title: string;
  dateTime: string;
  completed: boolean;
  notificationId?: string;
}

export type RootStackParamList = {
  ReminderList: undefined;
  ReminderForm: { reminderId?: string } | undefined;
  ReminderDetails: { reminderId: string };
};

export function validateReminder(title: string, dateTime: Date): string | null {
  if (!title.trim()) {
    return 'Please enter a reminder title.';
  }

  if (!Number.isFinite(dateTime.getTime()) || dateTime.getTime() <= Date.now()) {
    return 'Choose a date and time in the future.';
  }

  return null;
}

export function createReminderId(): string {
  return `reminder-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatReminderDate(dateTime: string): string {
  const date = new Date(dateTime);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (isSameLocalDate(date, today)) {
    return 'Today';
  }
  if (isSameLocalDate(date, tomorrow)) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
}

export function formatReminderTime(dateTime: string): string {
  return new Date(dateTime).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatReminderDateTime(dateTime: string): string {
  const date = new Date(dateTime);
  return `${date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })} at ${formatReminderTime(dateTime)}`;
}

export function isSameLocalDate(first: Date, second: Date): boolean {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

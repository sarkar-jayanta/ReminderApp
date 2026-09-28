import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LoadingState } from '../components/LoadingState';
import { MessageBanner } from '../components/MessageBanner';
import { useReminders } from '../hooks/RemindersContext';
import { getTheme } from '../theme/theme';
import type { RootStackParamList } from '../types/reminder';
import { formatReminderDateTime } from '../utils/dateUtils';
import { validateReminder } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'ReminderForm'>;
type PickerMode = 'date' | 'time';

function nextHour(): Date {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);
  return date;
}

export const ReminderFormScreen = ({ navigation, route }: Props) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);
  const { reminders, isLoading, isSaving, actionError, save, clearMessages } = useReminders();
  const reminderId = route.params?.reminderId;
  const existing = reminders.find(item => item.id === reminderId);
  const isEditing = Boolean(reminderId);
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState(nextHour);
  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [missingReminder, setMissingReminder] = useState(false);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setDateTime(new Date(existing.dateTime));
    } else if (isEditing && !isLoading) {
      setMissingReminder(true);
    }
  }, [existing, isEditing, isLoading]);

  const minimumDate = new Date();
  const onPickerChange = (_event: { nativeEvent: { timestamp: number } }, selectedDate: Date) => {
    if (pickerMode === 'date') {
      const next = new Date(dateTime);
      next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDateTime(next);
    } else {
      const next = new Date(dateTime);
      next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      setDateTime(next);
    }
    if (Platform.OS === 'android') {
      setPickerMode(null);
    }
  };

  const handleSave = async () => {
    const error = validateReminder(title, dateTime);
    if (error) {
      setValidationMessage(error);
      return;
    }
    setValidationMessage(null);
    const saved = await save({ title, dateTime, reminderId });
    if (saved) {
      navigation.goBack();
    }
  };

  if (isLoading && isEditing) {
    return <View style={[styles.screen, { backgroundColor: theme.background }]}><LoadingState theme={theme} /></View>;
  }

  if (missingReminder) {
    return (
      <View style={[styles.screen, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.topTitle, { color: theme.text }]}>Reminder not found</Text>
        <Text style={[styles.helper, { color: theme.muted }]}>It may have been deleted on another screen.</Text>
        <Pressable onPress={() => navigation.goBack()} style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
          <Text style={styles.primaryButtonText}>Back to reminders</Text>
        </Pressable>
      </View>
    );
  }

  const picker = pickerMode ? (
    <DateTimePicker
      mode={pickerMode}
      value={dateTime}
      minimumDate={pickerMode === 'date' ? minimumDate : undefined}
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onValueChange={onPickerChange}
      onDismiss={() => setPickerMode(null)}
      accentColor={theme.primary}
      themeVariant={colorScheme}
    />
  ) : null;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back" style={[styles.backButton, { backgroundColor: theme.surface }]}>
          <Text style={[styles.backText, { color: theme.text }]}>‹</Text>
        </Pressable>
        <Text style={[styles.topTitle, { color: theme.text }]}>{isEditing ? 'Edit reminder' : 'New reminder'}</Text>
        <View style={styles.topSpacer} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {actionError ? <MessageBanner theme={theme} tone="error" message={actionError} /> : null}
          {validationMessage ? <MessageBanner theme={theme} tone="error" message={validationMessage} /> : null}
          {existing?.completed ? (
            <MessageBanner theme={theme} tone="success" message="This reminder is completed. Editing it will keep it completed and won’t schedule a new notification." />
          ) : null}

          <Text style={[styles.label, { color: theme.text }]}>What do you need to remember?</Text>
          <TextInput
            value={title}
            onChangeText={value => { setTitle(value); setValidationMessage(null); clearMessages(); }}
            placeholder="e.g. Pick up groceries"
            placeholderTextColor={theme.muted}
            maxLength={120}
            returnKeyType="done"
            accessibilityLabel="Reminder title"
            style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
          />

          <Text style={[styles.label, styles.dateLabel, { color: theme.text }]}>When?</Text>
          <Pressable
            onPress={() => setPickerMode('date')}
            accessibilityRole="button"
            style={[styles.selection, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Image source={require('../assets/calandar.png')} style={[styles.selectionIcon, { tintColor: theme.primary }]} />
            <View style={styles.selectionCopy}>
              <Text style={[styles.selectionLabel, { color: theme.muted }]}>DATE</Text>
              <Text style={[styles.selectionValue, { color: theme.text }]}>{dateTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text>
            </View>
            <Text style={[styles.chevron, { color: theme.muted }]}>›</Text>
          </Pressable>
          <Pressable
            onPress={() => setPickerMode('time')}
            accessibilityRole="button"
            style={[styles.selection, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Image source={require('../assets/time.png')} style={[styles.selectionIcon, { tintColor: theme.primary }]} />
            <View style={styles.selectionCopy}>
              <Text style={[styles.selectionLabel, { color: theme.muted }]}>TIME</Text>
              <Text style={[styles.selectionValue, { color: theme.text }]}>{dateTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</Text>
            </View>
            <Text style={[styles.chevron, { color: theme.muted }]}>›</Text>
          </Pressable>

          {Platform.OS === 'ios' ? (
            <Modal visible={pickerMode !== null} transparent animationType="fade" onRequestClose={() => setPickerMode(null)}>
              <View style={styles.modalBackdrop}>
                <View style={[styles.pickerSheet, { backgroundColor: theme.surface }]}>
                  <View style={styles.pickerHeader}>
                    <Text style={[styles.pickerTitle, { color: theme.text }]}>{pickerMode === 'date' ? 'Choose a date' : 'Choose a time'}</Text>
                    <Pressable onPress={() => setPickerMode(null)} accessibilityRole="button"><Text style={[styles.doneText, { color: theme.primary }]}>Done</Text></Pressable>
                  </View>
                  {picker}
                </View>
              </View>
            </Modal>
          ) : picker}

          <Text style={[styles.preview, { color: theme.muted }]}>{formatReminderDateTime(dateTime.toISOString())}</Text>
          <Pressable
            onPress={() => { handleSave().catch(error => console.error('Failed to save reminder form:', error)); }}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving }}
            style={[styles.primaryButton, { backgroundColor: theme.primary }, isSaving && styles.disabledButton]}
          >
            <Text style={styles.primaryButtonText}>{isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Create reminder'}</Text>
          </Pressable>
          <Text style={[styles.helper, { color: theme.muted }]}>We’ll send a notification at the selected local time when notifications are enabled.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 28 },
  topBar: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  backButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
  backText: { fontSize: 31, lineHeight: 36, marginTop: -2 },
  topTitle: { fontSize: 17, fontWeight: '700' },
  topSpacer: { width: 42 },
  form: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 36 },
  label: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  input: { minHeight: 58, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, fontSize: 16 },
  dateLabel: { marginTop: 28 },
  selection: { minHeight: 74, borderWidth: 1, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 11 },
  selectionIcon: { width: 24, height: 24, marginRight: 12, resizeMode: 'contain' },
  selectionCopy: { flex: 1 },
  selectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 4 },
  selectionValue: { fontSize: 15, fontWeight: '600' },
  chevron: { fontSize: 27 },
  preview: { fontSize: 13, marginTop: 8, marginBottom: 24 },
  primaryButton: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  disabledButton: { opacity: 0.65 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  helper: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 15 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.42)', justifyContent: 'flex-end' },
  pickerSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 14, paddingBottom: 28 },
  pickerHeader: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  pickerTitle: { fontSize: 16, fontWeight: '700' },
  doneText: { fontSize: 16, fontWeight: '700' },
});

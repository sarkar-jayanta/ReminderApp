import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppTheme } from '../theme/theme';

export const ErrorState = ({ theme, message, onRetry }: {
  theme: AppTheme;
  message: string;
  onRetry: () => void;
}) => (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>We couldn’t load your reminders</Text>
      <Text style={[styles.copy, { color: theme.muted }]}>{message}</Text>
      <Pressable onPress={onRetry} accessibilityRole="button" style={[styles.button, { backgroundColor: theme.primary }]}>
        <Text style={styles.buttonText}>Try again</Text>
      </Pressable>
    </View>
  );

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  copy: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  button: { minHeight: 46, justifyContent: 'center', borderRadius: 13, paddingHorizontal: 22, marginTop: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});

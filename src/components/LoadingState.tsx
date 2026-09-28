import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { AppTheme } from '../theme/theme';

export const LoadingState = ({ theme }: { theme: AppTheme }) => (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.label, { color: theme.muted }]}>Loading reminders…</Text>
    </View>
  );

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: 14 },
  label: { fontSize: 15 },
});

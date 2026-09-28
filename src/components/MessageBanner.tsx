import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AppTheme } from '../theme/theme';

export const MessageBanner = ({ theme, message, tone = 'warning' }: {
  theme: AppTheme;
  message: string;
  tone?: 'warning' | 'error' | 'success';
}) => {
  const backgroundColor = tone === 'error' ? theme.dangerSurface : tone === 'success' ? theme.surfaceMuted : theme.warningSurface;
  const color = tone === 'error' ? theme.danger : tone === 'success' ? theme.success : theme.warning;
  return (
    <View accessibilityRole="alert" style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 13, borderRadius: 14, marginBottom: 14 },
  text: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
});

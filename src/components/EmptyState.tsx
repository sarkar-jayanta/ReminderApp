import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AppTheme } from '../theme/theme';

export const EmptyState = ({ theme }: { theme: AppTheme }) => (
    <View style={styles.container}>
      <View style={[styles.icon, { backgroundColor: theme.surfaceMuted }]}>
        <Text style={[styles.iconText, { color: theme.primary }]}>✓</Text>
      </View>
      <Text style={[styles.title, { color: theme.text }]}>Nothing on your list</Text>
      <Text style={[styles.copy, { color: theme.muted }]}>Create a reminder and we’ll help you stay on top of it.</Text>
    </View>
  );

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, paddingVertical: 56 },
  icon: { width: 68, height: 68, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  iconText: { fontSize: 31 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  copy: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
});

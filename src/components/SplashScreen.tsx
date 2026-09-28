import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import type { AppTheme } from '../theme/theme';

interface SplashScreenProps {
  theme: AppTheme;
  duration: number;
}

export const SplashScreen = ({ theme, duration }: SplashScreenProps) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [duration, progress]);

  return (
    <View style={[styles.screen, { backgroundColor: "#fff" }]}>
      <View style={styles.brand}>
        <View style={[styles.mark, { backgroundColor: "#fff" }]}>
         <Image source={require('../assets/logo.jpg')} style={{}} />
        </View>
        <Text style={[styles.name, { color: "#000" }]}>ReminderApp</Text>
        {/* <Text style={[styles.tagline, { color: theme.primary }]}>YOUR DAY, IN GOOD HANDS</Text> */}
      </View>
      <View style={[styles.progressTrack, { backgroundColor: "#e0e0e0" }]}>
        <Animated.View
          style={[
            styles.progress,
            {
              backgroundColor: theme.primary,
              width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  brand: { alignItems: 'center' },
  mark: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  check: { color: '#FFFFFF', fontSize: 48, fontWeight: '600', lineHeight: 54, marginTop: -4 },
  name: { fontSize: 32, fontWeight: '700', marginTop:8},
  tagline: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginTop: 10 },
  progressTrack: { position: 'absolute', bottom: 38, width: 112, height: 3, borderRadius: 2, overflow: 'hidden' },
  progress: { height: '100%', borderRadius: 2 },
});
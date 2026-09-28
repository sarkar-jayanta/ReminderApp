import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreen } from './src/components/SplashScreen';
import { RemindersProvider } from './src/hooks/RemindersContext';
import { getTheme } from './src/theme/theme';

const SPLASH_DURATION_MS = 4000;

const App = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = getTheme(colorScheme);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <RemindersProvider>
          <View style={styles.appContent}>
            <AppNavigator />
            {showSplash && (
              <View style={StyleSheet.absoluteFill} pointerEvents="auto">
                <SplashScreen theme={theme} duration={SPLASH_DURATION_MS} />
              </View>
            )}
          </View>
        </RemindersProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  appContent: { flex: 1 },
});

export default App;

import type { ColorSchemeName } from 'react-native';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  muted: string;
  primary: string;
  primaryPressed: string;
  border: string;
  danger: string;
  dangerSurface: string;
  success: string;
  warning: string;
  warningSurface: string;
  shadow: string;
}

export const themes: Record<'light' | 'dark', ThemeColors> = {
  light: {
    background: '#F5F7FB',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF2F8',
    text: '#172033',
    muted: '#667085',
    primary: '#5267E8',
    primaryPressed: '#3E51CA',
    border: '#E2E7F0',
    danger: '#C23942',
    dangerSurface: '#FDECEE',
    success: '#18815C',
    warning: '#8A5A00',
    warningSurface: '#FFF3D6',
    shadow: '#19233A',
  },
  dark: {
    background: '#101522',
    surface: '#1A2232',
    surfaceMuted: '#252F42',
    text: '#F3F5FA',
    muted: '#A6B0C2',
    primary: '#8795FF',
    primaryPressed: '#AAB4FF',
    border: '#303B50',
    danger: '#FF969C',
    dangerSurface: '#3B252E',
    success: '#73D5AE',
    warning: '#FFD275',
    warningSurface: '#3B3220',
    shadow: '#000000',
  },
};

export type AppTheme = ThemeColors;
export function getTheme(colorScheme: ColorSchemeName): AppTheme {
  return colorScheme === 'dark' ? themes.dark : themes.light;
}

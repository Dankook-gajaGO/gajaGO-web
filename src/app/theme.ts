import { StyleSheet } from 'react-native';

export const COLORS = {
  teal: '#00BDB0',
  blue: '#0077C8',
  orange: '#FF9500',
  red: '#FF3B30',
  purple: '#8E5CF6',
  ink: '#1C1C1E',
  text: '#3C3C3E',
  muted: '#8E8E93',
  line: '#E5E5EA',
  screen: '#F4F6F8',
  card: '#F7F8FA',
  white: '#FFFFFF',
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
};

export const shadow = StyleSheet.create({
  card: {
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
});

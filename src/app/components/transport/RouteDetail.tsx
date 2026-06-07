import { StyleSheet, Text, View } from 'react-native';
import type { TransportRoute } from '../../api';
import { COLORS, radius, shadow } from '../../theme';

interface RouteDetailProps {
  route: TransportRoute | null;
}

export function RouteDetail({ route }: RouteDetailProps) {
  if (!route) return null;

  return (
    <View style={[styles.card, shadow.card]}>
      <Text style={styles.title}>선택한 경로 상세</Text>
      {route.detail
        .split('\n')
        .filter(Boolean)
        .map((step, stepIndex) => (
          <View key={`${route.id}-${stepIndex}`} style={styles.stepRow}>
            <View style={styles.stepDot}>
              <Text style={styles.stepNumber}>{stepIndex + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  title: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNumber: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: '900',
  },
  stepText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
});

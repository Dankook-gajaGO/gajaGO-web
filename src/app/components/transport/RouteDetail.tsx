import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { PlaceCandidate, TransportRoute } from '../../api';
import { COLORS, radius, shadow } from '../../theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

interface RouteDetailProps {
  route: TransportRoute | null;
  departure: PlaceCandidate | null;
  destination: PlaceCandidate | null;
  isSavingSchedule?: boolean;
  onSaveToSchedule?: () => void;
}

interface ParsedStep {
  label: string;
  icon: FeatherName;
  color: string;
}

function parseStep(step: string, index: number, total: number): ParsedStep {
  const label = step.replace(/^\s*\d+\.\s*/, '').trim();
  const upper = label.toUpperCase();

  if (index === total - 1) {
    return { label, icon: 'map-pin', color: COLORS.blue };
  }

  if (label.includes('도보') || upper.includes('WALK')) {
    return { label, icon: 'navigation', color: COLORS.teal };
  }

  if (label.includes('버스') || upper.includes('BUS')) {
    return { label, icon: 'truck', color: COLORS.orange };
  }

  if (label.includes('지하철') || label.includes('호선') || upper.includes('SUBWAY')) {
    return { label, icon: 'git-branch', color: COLORS.purple };
  }

  return { label, icon: 'repeat', color: COLORS.muted };
}

function openGoogleDirections(departure: PlaceCandidate | null, destination: PlaceCandidate | null) {
  if (!departure || !destination) return;

  const origin = `${departure.lat},${departure.lng}`;
  const target = `${destination.lat},${destination.lng}`;
  const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(target)}&travelmode=transit`;
  void Linking.openURL(url);
}

export function RouteDetail({
  route,
  departure,
  destination,
  isSavingSchedule = false,
  onSaveToSchedule,
}: RouteDetailProps) {
  if (!route) return null;

  const rawSteps = route.detail.split('\n').filter(Boolean);
  const steps = rawSteps.map((step, index) => parseStep(step, index, rawSteps.length));

  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>선택한 경로 상세</Text>
          <Text style={styles.subtitle}>
            {route.travelTime}분 · 환승 {route.transfers}회 · 도보{' '}
            {route.walkingDistance.toLocaleString()}m
          </Text>
        </View>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{route.rank}순위</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={styles.actionButton}
          onPress={() => openGoogleDirections(departure, destination)}
          disabled={!departure || !destination}
        >
          <Feather name="external-link" size={15} color={COLORS.ink} />
          <Text style={styles.actionText}>지도 열기</Text>
        </Pressable>
        {onSaveToSchedule ? (
          <Pressable
            style={[styles.primaryActionButton, isSavingSchedule ? styles.disabledButton : null]}
            onPress={onSaveToSchedule}
            disabled={isSavingSchedule}
          >
            <Feather name="calendar" size={15} color={COLORS.white} />
            <Text style={styles.primaryActionText}>일정 저장</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.timeline}>
        {steps.map((step, stepIndex) => (
          <View key={`${route.id}-${stepIndex}`} style={styles.stepRow}>
            <View style={styles.markerColumn}>
              <View style={[styles.stepDot, { backgroundColor: `${step.color}22` }]}>
                <Feather name={step.icon} size={14} color={step.color} />
              </View>
              {stepIndex < steps.length - 1 ? <View style={styles.stepLine} /> : null}
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepLabel}>STEP {stepIndex + 1}</Text>
              <Text style={styles.stepText}>{step.label}</Text>
            </View>
          </View>
        ))}
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  rankBadge: {
    borderRadius: 999,
    backgroundColor: '#E5F7F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  rankText: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  actionButton: {
    minHeight: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 6,
  },
  primaryActionButton: {
    minHeight: 40,
    borderRadius: radius.md,
    backgroundColor: COLORS.teal,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryActionText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 6,
  },
  disabledButton: {
    opacity: 0.55,
  },
  timeline: {
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  markerColumn: {
    width: 34,
    alignItems: 'center',
    marginRight: 10,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.line,
    marginVertical: 4,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 15,
  },
  stepLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 3,
  },
  stepText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
  },
});

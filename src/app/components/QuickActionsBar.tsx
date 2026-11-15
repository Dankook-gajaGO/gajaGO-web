import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, radius } from '../theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

export interface QuickAction {
  id: 'facilities' | 'transport' | 'food' | 'payment' | 'emergency';
  label: string;
  icon: FeatherName;
  color: string;
  bg: string;
}

export function makeQuickActions(): QuickAction[] {
  return [
    { id: 'facilities', label: '편의시설', icon: 'map', color: COLORS.blue, bg: '#EFF5FF' },
    { id: 'transport', label: '길찾기', icon: 'navigation', color: COLORS.purple, bg: '#F4F0FF' },
    { id: 'food', label: '음식', icon: 'coffee', color: COLORS.orange, bg: '#FFF5E6' },
    { id: 'payment', label: '결제', icon: 'credit-card', color: COLORS.teal, bg: COLORS.tealSoft },
    { id: 'emergency', label: '긴급', icon: 'alert-triangle', color: COLORS.red, bg: '#FFF0F0' },
  ];
}

interface QuickActionsBarProps {
  actions: QuickAction[];
  onSelect: (action: QuickAction) => void;
  title?: string;
}

// 5개가 한 줄에 다 보이게 (가로 스크롤에선 5번째가 잘려 보였음)
export function QuickActionsBar({ actions, onSelect, title = '빠른 기능' }: QuickActionsBarProps) {
  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            style={({ pressed }) => [styles.item, pressed ? styles.pressed : null]}
            onPress={() => onSelect(action)}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <View style={[styles.iconWrap, { backgroundColor: action.bg }]}>
              <Feather name={action.icon} size={22} color={action.color} />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 20,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
});

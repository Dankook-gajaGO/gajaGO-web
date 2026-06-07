import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
    { id: 'transport', label: '교통 경로', icon: 'navigation', color: COLORS.purple, bg: '#F4F0FF' },
    { id: 'food', label: '음식', icon: 'coffee', color: COLORS.orange, bg: '#FFF5E6' },
    { id: 'payment', label: '결제 정보', icon: 'credit-card', color: COLORS.teal, bg: '#E5F7F7' },
    { id: 'emergency', label: '긴급 상황', icon: 'alert-triangle', color: COLORS.red, bg: '#FFF0F0' },
  ];
}

interface QuickActionsBarProps {
  actions: QuickAction[];
  onSelect: (action: QuickAction) => void;
  title?: string;
}

export function QuickActionsBar({ actions, onSelect, title = '빠른 기능' }: QuickActionsBarProps) {
  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            style={[styles.card, { backgroundColor: action.bg, borderColor: `${action.color}30` }]}
            onPress={() => onSelect(action)}
          >
            <View style={[styles.iconWrap, { backgroundColor: action.color }]}>
              <Feather name={action.icon} size={21} color={COLORS.white} />
            </View>
            <Text style={styles.label}>{action.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '800',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 20,
  },
  card: {
    width: 96,
    minHeight: 104,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginRight: 10,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  label: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});

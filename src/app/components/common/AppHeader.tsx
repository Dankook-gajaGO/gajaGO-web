import type { ReactNode } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, radius } from '../../theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function AppHeader({ title, subtitle, onBack, right }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable style={styles.iconButton} onPress={onBack} hitSlop={8}>
          <Feather name="chevron-left" size={22} color={COLORS.ink} />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: 12,
  },
  title: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  right: {
    width: 40,
    minHeight: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, radius } from '../../theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

interface AuthBrandProps {
  icon: FeatherName;
  title: string;
  tagline: string;
}

export function AuthBrand({ icon, title, tagline }: AuthBrandProps) {
  return (
    <View style={styles.brandBlock}>
      <View style={styles.logo}>
        <Feather name={icon} size={34} color={COLORS.white} />
      </View>
      <Text style={styles.brand}>{title}</Text>
      <Text style={styles.tagline}>{tagline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brandBlock: {
    alignItems: 'center',
    marginBottom: 34,
  },
  logo: {
    width: 74,
    height: 74,
    borderRadius: radius.xl,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    elevation: 3,
  },
  brand: {
    color: COLORS.ink,
    fontSize: 28,
    fontWeight: '900',
  },
  tagline: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

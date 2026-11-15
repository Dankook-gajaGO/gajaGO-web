import Feather from '@expo/vector-icons/Feather';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { COLORS, shadow } from '../../theme';

interface LocationFloatingButtonProps {
  isBusy: boolean;
  onPress: () => void;
}

export function LocationFloatingButton({ isBusy, onPress }: LocationFloatingButtonProps) {
  return (
    <Pressable
      style={[styles.locationButton, isBusy && styles.locationButtonDisabled]}
      onPress={onPress}
      disabled={isBusy}
    >
      {isBusy ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Feather name="crosshair" size={24} color={COLORS.white} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  locationButton: {
    position: 'absolute',
    right: 22,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  locationButtonDisabled: {
    opacity: 0.72,
  },
});

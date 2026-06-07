import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, radius } from '../../theme';

interface FacilityErrorNoticeProps {
  message: string;
}

export function FacilityErrorNotice({ message }: FacilityErrorNoticeProps) {
  if (!message) return null;

  return (
    <View style={styles.errorBox}>
      <Feather name="alert-circle" size={16} color={COLORS.red} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    minHeight: 42,
    borderRadius: radius.sm,
    backgroundColor: '#FFF1F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: COLORS.red,
    fontSize: 12,
    lineHeight: 17,
  },
});

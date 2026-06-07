import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';

export function HomeTopBar() {
  return (
    <View style={styles.topBar}>
      <Text style={styles.logo}>가자고</Text>
      <View style={styles.notificationButton}>
        <Feather name="bell" size={18} color={COLORS.text} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    minHeight: 58,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    color: COLORS.teal,
    fontSize: 20,
    fontWeight: '900',
  },
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

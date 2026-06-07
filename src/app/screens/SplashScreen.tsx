import { useEffect } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../routes';
import { COLORS, radius } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1200);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <View style={styles.logoMark}>
        <Feather name="send" size={42} color={COLORS.white} />
      </View>
      <Text style={styles.brand}>가자고</Text>
      <Text style={styles.caption}>한국 여행을 쉽고 안전하게</Text>
      <View style={styles.dots}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoMark: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    elevation: 4,
  },
  brand: {
    color: COLORS.ink,
    fontSize: 30,
    fontWeight: '900',
  },
  caption: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 8,
  },
  dots: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.teal,
    marginHorizontal: 4,
  },
});

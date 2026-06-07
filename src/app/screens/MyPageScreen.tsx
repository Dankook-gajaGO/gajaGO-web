import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setAuthToken } from '../api';
import { AppHeader } from '../components/common/AppHeader';
import { BottomNavBar } from '../components/BottomNavBar';
import type { RootStackParamList } from '../routes';
import { COLORS, radius } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MyPage'>;
type FeatherName = ComponentProps<typeof Feather>['name'];

const rows: Array<{
  label: string;
  caption: string;
  icon: FeatherName;
  action: 'saved' | 'logout';
  danger?: boolean;
}> = [
  {
    label: '저장한 행사',
    caption: '관심 있는 행사를 저장 목록에서 확인합니다.',
    icon: 'heart',
    action: 'saved',
  },
  {
    label: '로그아웃',
    caption: '로그인 화면으로 돌아갑니다.',
    icon: 'log-out',
    action: 'logout',
    danger: true,
  },
];

export default function MyPageScreen({ navigation }: Props) {
  const handleRow = async (action: 'saved' | 'logout') => {
    if (action === 'saved') {
      navigation.navigate('SavedEvents');
      return;
    }

    await setAuthToken(null);
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="마이페이지" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Feather name="user" size={30} color={COLORS.teal} />
          </View>
          <View style={styles.profileText}>
            <Text style={styles.name}>내 계정</Text>
            <Text style={styles.email}>여행 기록과 저장 항목을 확인합니다</Text>
          </View>
        </View>

        <View style={styles.rows}>
          {rows.map((row) => (
            <Pressable key={row.label} style={styles.row} onPress={() => handleRow(row.action)}>
              <View style={[styles.rowIcon, row.danger ? styles.dangerIcon : null]}>
                <Feather name={row.icon} size={20} color={row.danger ? COLORS.red : COLORS.teal} />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, row.danger ? styles.dangerText : null]}>{row.label}</Text>
                <Text style={styles.rowCaption}>{row.caption}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.muted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <BottomNavBar active="MyPage" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: 20,
    paddingBottom: 28,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: radius.xl,
    backgroundColor: COLORS.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileText: {
    flex: 1,
  },
  name: {
    color: COLORS.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  email: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },
  rows: {
    marginTop: 18,
    borderRadius: radius.xl,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: 'hidden',
  },
  row: {
    minHeight: 72,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: '#E5F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerIcon: {
    backgroundColor: '#FFF0F0',
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  dangerText: {
    color: COLORS.red,
  },
  rowCaption: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
});

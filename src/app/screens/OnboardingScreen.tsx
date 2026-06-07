import { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/common/Screen';
import type { RootStackParamList } from '../routes';
import { COLORS, radius } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;
type FeatherName = ComponentProps<typeof Feather>['name'];

const pages: Array<{
  title: string;
  body: string;
  icon: FeatherName;
  color: string;
}> = [
  {
    title: '여행 정보를 한눈에',
    body: '행사, 교통, 음식, 긴급 정보를 모바일 화면에서 빠르게 확인하세요.',
    icon: 'map-pin',
    color: COLORS.teal,
  },
  {
    title: '일정을 가볍게 정리',
    body: '서버 기준 날짜로 캘린더를 열고 선택한 날짜의 일정을 확인할 수 있습니다.',
    icon: 'calendar',
    color: COLORS.blue,
  },
  {
    title: '한국 여행 도우미',
    body: '교통 챗봇, 알레르기 음식 조회, 긴급 연락처를 필요한 순간 바로 사용할 수 있습니다.',
    icon: 'navigation',
    color: COLORS.orange,
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const page = pages[index];
  const last = index === pages.length - 1;

  const next = () => {
    if (last) {
      navigation.replace('Login');
      return;
    }
    setIndex((value) => value + 1);
  };

  return (
    <Screen contentContainerStyle={styles.screen}>
      <Pressable style={styles.skip} onPress={() => navigation.replace('Login')}>
        <Text style={styles.skipText}>건너뛰기</Text>
      </Pressable>
      <View style={styles.hero}>
        <View style={[styles.iconShell, { backgroundColor: page.color }]}>
          <Feather name={page.icon} size={48} color={COLORS.white} />
        </View>
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.body}>{page.body}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.pager}>
          {pages.map((item, pageIndex) => (
            <View key={item.title} style={[styles.pageDot, pageIndex === index ? styles.activeDot : null]} />
          ))}
        </View>
        <Pressable style={styles.button} onPress={next}>
          <Text style={styles.buttonText}>{last ? '시작하기' : '다음'}</Text>
          <Feather name="chevron-right" size={20} color={COLORS.white} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
  },
  skip: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  iconShell: {
    width: 148,
    height: 148,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 34,
    elevation: 3,
  },
  title: {
    color: COLORS.ink,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  body: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
  },
  footer: {
    paddingBottom: 10,
  },
  pager: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.line,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.teal,
  },
  button: {
    minHeight: 56,
    borderRadius: radius.lg,
    backgroundColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
    marginRight: 6,
  },
});

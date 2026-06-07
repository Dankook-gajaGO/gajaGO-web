import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavBar } from '../components/BottomNavBar';
import { makeQuickActions, QuickActionsBar, type QuickAction } from '../components/QuickActionsBar';
import { FestivalBannerList } from '../components/home/FestivalBannerList';
import { HomeShortcutCards } from '../components/home/HomeShortcutCards';
import { HomeTopBar } from '../components/home/HomeTopBar';
import { useHomeFestivalBanners } from '../hooks/useHomeFestivalBanners';
import type { RootStackParamList } from '../routes';
import { COLORS } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const country = 'korea' as const;

export default function KoreaHomeScreen({ navigation }: Props) {
  const actions = makeQuickActions();
  const { events, isLoading } = useHomeFestivalBanners();

  const goQuickAction = (action: QuickAction) => {
    if (action.id === 'facilities') navigation.navigate('Facilities', { country });
    if (action.id === 'transport') navigation.navigate('Transport', { country });
    if (action.id === 'food') navigation.navigate('Food', { country });
    if (action.id === 'payment') navigation.navigate('Payment', { country });
    if (action.id === 'emergency') navigation.navigate('Emergency', { country });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <HomeTopBar />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>행사 & 축제</Text>
          <Pressable onPress={() => navigation.navigate('AllEvents', { country })}>
            <Text style={styles.linkText}>전체보기</Text>
          </Pressable>
        </View>

        <FestivalBannerList
          events={events}
          isLoading={isLoading}
          onSelectEvent={(event) =>
            navigation.navigate('EventDetails', { country, eventId: event.id })
          }
        />

        <QuickActionsBar actions={actions} onSelect={goQuickAction} />

        <HomeShortcutCards
          onOpenCalendar={() => navigation.navigate('CalendarDetail', { country })}
          onOpenSchedule={() => navigation.navigate('Schedule', { country })}
          onOpenEvents={() => navigation.navigate('AllEvents', { country })}
        />
      </ScrollView>

      <BottomNavBar active="Home" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    paddingBottom: 26,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  linkText: {
    color: COLORS.teal,
    fontSize: 13,
    fontWeight: '800',
  },
});

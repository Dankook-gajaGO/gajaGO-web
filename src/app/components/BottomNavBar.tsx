import type { NavigationProp } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { HomeTabRoute, RootStackParamList } from '../routes';
import { COLORS } from '../theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

interface NavItem {
  route: HomeTabRoute;
  label: string;
  icon: FeatherName;
}

const navItems: NavItem[] = [
  { route: 'Home', label: '홈', icon: 'home' },
  { route: 'Schedule', label: '일정', icon: 'map-pin' },
  { route: 'CalendarDetail', label: '캘린더', icon: 'calendar' },
  { route: 'MyPage', label: 'My', icon: 'user' },
];

interface BottomNavBarProps {
  active: HomeTabRoute;
  navigation: NavigationProp<RootStackParamList>;
}

export function BottomNavBar({ active, navigation }: BottomNavBarProps) {
  const handlePress = (route: HomeTabRoute) => {
    if (route === 'Schedule') {
      navigation.navigate('Schedule', { country: 'korea' });
      return;
    }
    if (route === 'CalendarDetail') {
      navigation.navigate('CalendarDetail', { country: 'korea' });
      return;
    }
    navigation.navigate(route);
  };

  return (
    <View style={styles.bar}>
      {navItems.map((item) => {
        const selected = active === item.route;
        return (
          <Pressable key={item.route} style={styles.item} onPress={() => handlePress(item.route)}>
            <Feather name={item.icon} size={22} color={selected ? COLORS.teal : '#B8BCC4'} />
            <Text style={[styles.label, selected ? styles.activeLabel : styles.inactiveLabel]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 64,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    marginTop: 3,
  },
  activeLabel: {
    color: COLORS.teal,
    fontWeight: '800',
  },
  inactiveLabel: {
    color: '#B8BCC4',
    fontWeight: '600',
  },
});

export type CountryKey = 'korea';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Transport: { country?: CountryKey } | undefined;
  Food: { country?: CountryKey } | undefined;
  Facilities: { country?: CountryKey } | undefined;
  Emergency: { country?: CountryKey } | undefined;
  Schedule: { country?: CountryKey; date?: string } | undefined;
  SavedEvents: undefined;
  MyPage: undefined;
  AllEvents: { country?: CountryKey } | undefined;
  EventDetails: { eventId?: string; country?: CountryKey } | undefined;
  CalendarDetail: { country?: CountryKey; date?: string } | undefined;
  Payment: { country?: CountryKey } | undefined;
};

export type HomeTabRoute = 'Home' | 'Schedule' | 'CalendarDetail' | 'MyPage';

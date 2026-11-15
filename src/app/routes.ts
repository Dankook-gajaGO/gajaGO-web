export type CountryKey = 'korea';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  // returnAfterLogin: 저장 등을 하려다 로그인 화면이 뜬 경우. 로그인하면 원래 화면으로 돌아감
  Login: { returnAfterLogin?: boolean } | undefined;
  Signup: { returnAfterLogin?: boolean } | undefined;
  Home: undefined;
  Transport:
    | {
        country?: CountryKey;
        initialMessage?: string;
        destination?: { name: string; address: string; lat: number; lng: number };
      }
    | undefined;
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
  Expense: undefined;
  ShowCard: { title: string; korean: string; english: string };
};

export type HomeTabRoute = 'Home' | 'Schedule' | 'CalendarDetail' | 'MyPage';

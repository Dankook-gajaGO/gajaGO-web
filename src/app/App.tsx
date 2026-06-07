import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import AllEventsScreen from './screens/AllEventsScreen';
import CalendarDetailScreen from './screens/CalendarDetailScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import FacilitiesScreen from './screens/FacilitiesScreen';
import FoodScreenAllergy from './screens/FoodScreenAllergy';
import KoreaHomeScreen from './screens/KoreaHomeScreen';
import LoginScreen from './screens/LoginScreen';
import MyPageScreen from './screens/MyPageScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import PaymentScreen from './screens/PaymentScreen';
import SavedEventsScreen from './screens/SavedEventsScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import SignupScreen from './screens/SignupScreen';
import SplashScreen from './screens/SplashScreen';
import TransportScreen from './screens/TransportScreen';
import type { RootStackParamList } from './routes';
import { COLORS } from './theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: COLORS.white },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={KoreaHomeScreen} />
        <Stack.Screen name="Transport" component={TransportScreen} />
        <Stack.Screen name="Food" component={FoodScreenAllergy} />
        <Stack.Screen name="Facilities" component={FacilitiesScreen} />
        <Stack.Screen name="Emergency" component={EmergencyScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="SavedEvents" component={SavedEventsScreen} />
        <Stack.Screen name="MyPage" component={MyPageScreen} />
        <Stack.Screen name="AllEvents" component={AllEventsScreen} />
        <Stack.Screen name="EventDetails" component={EventDetailScreen} />
        <Stack.Screen name="CalendarDetail" component={CalendarDetailScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

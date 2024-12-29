import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from "react-native-paper";
import * as Linking from "expo-linking";

// Screens
import SplashScreen from "./src/screens/SplashScreen";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import DashboardScreen from "./src/screens/Coordinator/DashboardScreen"
import CoordinatorNavigator from './src/navigation/CoordinatorNavigator';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ["psef-tasks://"],
  config: {
    screens: {
      ResetPassword: "reset_password/:resetToken",
      SignIn: "sign_in",
      SignUp: "sign_up",
      Dashboard: "dashboard",
    },
  },
};

const App = () => {
  return (
    <PaperProvider>
      <NavigationContainer linking={linking}>
      {/* Stack Navigator to manage screens */}
      <Stack.Navigator
        initialRouteName="Splash" // Start with the splash screen
        screenOptions={{ headerShown: false }} // Hide default headers for all screens
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="CoordinatorNavigator" component={CoordinatorNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
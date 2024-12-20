import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from "expo-linking";

// Screens
import SplashScreen from "./src/screens/SplashScreen";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import HomeScreen from "./src/screens/HomeScreen"

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ["psef-tasks://"],
  config: {
    screens: {
      ResetPassword: "reset_password/:resetToken",
      SignIn: "sign_in",
      SignUp: "sign_up",
      Home: "home",
    },
  },
};

const App = () => {
  return (
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
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
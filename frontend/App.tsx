import React, { useEffect } from 'react';
import { NavigationContainer, NavigationProp, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from "react-native-paper";
import * as Linking from "expo-linking";

import { TasksProvider } from './src/hooks/useTasksContext';
import SplashScreen from "./src/screens/SplashScreen";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import CoordinatorNavigator from './src/navigation/CoordinatorNavigator';
import { UsersProvider } from './src/hooks/useUsersContext';
import { RootStackParamList } from './src/navigation/RootStackParamList';
import { UserDataProvider } from './src/hooks/useUserDataContext';
import { UserTasksProvider } from './src/hooks/useUserTasksContext';
import UserNavigator from './src/navigation/UserNavigator';
import RootNavigationHandler from './src/components/RootNavigationHandler';
import { StatusBar } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
    <TasksProvider>
      <UsersProvider>
        <UserTasksProvider>
          <UserDataProvider>
            <PaperProvider>
              <NavigationContainer linking={linking}>
                <StatusBar hidden={false} />
                <RootNavigationHandler />
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
                  <Stack.Screen name="UserNavigator" component={UserNavigator} />
                </Stack.Navigator>
              </NavigationContainer>
            </PaperProvider>
          </UserDataProvider>
        </UserTasksProvider>
      </UsersProvider>
    </TasksProvider>
  );
};

export default App;
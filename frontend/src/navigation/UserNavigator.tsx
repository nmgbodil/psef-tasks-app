import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { UserStackParamList } from "./UserStackParamList";
import Sidebar from "../components/UserSidebar";

const Stack = createNativeStackNavigator<UserStackParamList>();

const UserNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Sidebar"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="Sidebar" component={Sidebar} options={{ title: "Sidebar" }} />
        </Stack.Navigator>
    )
};

export default UserNavigator;
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { UserStackParamList } from "./UserStackParamList";
import Sidebar from "../components/UserSidebar";
import TaskDetailsScreen from "../screens/User/TaskDetailsScreen";
import SearchTaskScreen from "../screens/User/SearchTaskScreen";

const Stack = createNativeStackNavigator<UserStackParamList>();

const UserNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Sidebar"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="Sidebar" component={Sidebar} options={{ title: "Sidebar" }} />
            <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{ title: "Task Details" }} />
            <Stack.Screen name="SearchTask" component={SearchTaskScreen} options={{ title: "Search Task"}} />
        </Stack.Navigator>
    )
};

export default UserNavigator;
import React from "react";
// import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Sidebar from "./CoordinatorSidebar";
import TaskDetailsScreen from "../screens/Coordinator/TaskDetailsScreen";
import { CoordinatorStackParamList } from "./types";

// const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator<CoordinatorStackParamList>();

const CoordinatorNavigator = () => {
    return (
        <Stack.Navigator
        initialRouteName="Sidebar"
        screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="Sidebar" component={Sidebar} options={{ title: "Sidebar" }} />
            <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{ title: "Task Details" }} />
        </Stack.Navigator>
    );
};

export default CoordinatorNavigator;
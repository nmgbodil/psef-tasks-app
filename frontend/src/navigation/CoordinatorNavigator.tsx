import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Sidebar from "./CoordinatorSidebar";
import TaskDetailsScreen from "../screens/Coordinator/TaskDetailsScreen";
import { CoordinatorStackParamList } from "./types";
import AssignTaskScreen from "../screens/Coordinator/AssignTaskScreen";
import UpdateTaskScreen from "../screens/Coordinator/UpdateTaskScreen";

const Stack = createNativeStackNavigator<CoordinatorStackParamList>();

const CoordinatorNavigator = () => {
    return (
        <Stack.Navigator
        initialRouteName="Sidebar"
        screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="Sidebar" component={Sidebar} options={{ title: "Sidebar" }} />
            <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{ title: "Task Details" }} />
            <Stack.Screen name="AssignTask" component={AssignTaskScreen} options={{ title: "Assign Task" }} />
            <Stack.Screen name="UpdateTask" component={UpdateTaskScreen} options={{ title: "Update Task" }} />
        </Stack.Navigator>
    );
};

export default CoordinatorNavigator;
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Sidebar from "../components/CoordinatorSidebar";
import TaskDetailsScreen from "../screens/Coordinator/TaskDetailsScreen";
import AssignTaskScreen from "../screens/Coordinator/AssignTaskScreen";
import UpdateTaskScreen from "../screens/Coordinator/UpdateTaskScreen";
import UpdateAssignmentScreen from "../screens/Coordinator/UpdateAssignmentScreen";
import CreateTaskScreen from "../screens/Coordinator/CreateTaskScreen";
import { CoordinatorStackParamList } from "./CoordinatorStackParamList";
import SearchTaskScreen from "../screens/Coordinator/SearchTaskScreen";

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
            <Stack.Screen name="UpdateAssignment" component={UpdateAssignmentScreen} options={{ title: "Update Assignment" }} />
            <Stack.Screen name="CreateTask" component={CreateTaskScreen} options={{ title: "Create Task" }} />
            <Stack.Screen name="SearchTask" component={SearchTaskScreen} />
        </Stack.Navigator>
    );
};

export default CoordinatorNavigator;
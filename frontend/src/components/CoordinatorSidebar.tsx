import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import DashboardScreen from "../screens/Coordinator/DashboardScreen";
import UsersScreen from "../screens/Coordinator/UsersScreen";
import TasksScreen from "../screens/Coordinator/TasksScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Drawer = createDrawerNavigator();

const Sidebar = () => {
    return (
        <Drawer.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
            headerShown: true,
            drawerType: "slide",
            drawerStyle: {
                backgroundColor: "#f8f9fa",
                width: 240,
            },
        }}
        >
            <Drawer.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ title: "Dashboard" }}
            />
            <Drawer.Screen
            name="Users"
            component={UsersScreen}
            options={{ title: "Users" }}
            />
            <Drawer.Screen
            name="Tasks"
            component={TasksScreen}
            options={{ title: "Tasks" }}
            />
            <Drawer.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "Profile" }}
            />
        </Drawer.Navigator>
    );
};

export default Sidebar;
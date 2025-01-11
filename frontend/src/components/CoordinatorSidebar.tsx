import React from "react";
import { createDrawerNavigator, DrawerToggleButton } from "@react-navigation/drawer";

import DashboardScreen from "../screens/Coordinator/DashboardScreen";
import UsersScreen from "../screens/Coordinator/UsersScreen";
import TasksScreen from "../screens/Coordinator/TasksScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { gold } from "../utils/colors";

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
            drawerLabelStyle: {
                color: "black",
                fontSize: 16,
            },
            drawerActiveTintColor: `${gold}`,
            drawerInactiveTintColor: "#6c757d",
            headerLeft: (props) => (
                <DrawerToggleButton {...props} tintColor={gold} />
            )
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
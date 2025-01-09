import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import DashboardScreen from "../screens/User/DashboardScreen";

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
        </Drawer.Navigator>
    )
};

export default Sidebar;
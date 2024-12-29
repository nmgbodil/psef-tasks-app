import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";

const Sidebar = () => {
    const navigation = useNavigation();

    const links = [
        { name: "Dashboard", route: "Dashboard" },
        { name: "Tasks", route: "Tasks" },
        { name: "Users", route: "Users" },
        { name: "Profile", route: "Profile"},
    ];

    return (
        <View style={styles.sidebar}>
            <Text style={styles.title}>Coordinator</Text>
            {links.map((link) => (
                <TouchableOpacity
                key={link.route}
                style={styles.link}
                onPress={() => {
                    navigation.dispatch(DrawerActions.closeDrawer()); // Close the drawer
                    navigation.navigate(link.route); // Navigate to the selected screen
                }}
                >
                    <Text style={styles.linkText}>{link.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    sidebar: {
        flex: 1,
        backgroundColor: "#f4f4f4",
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 24,
        color: "#333",
    },
    link: {
        paddingVertical: 12,
        paddingHorizontal: 8,
        marginBottom: 8,
        borderRadius: 4,
        backgroundColor: "#e9e9e9",
    },
    linkText: {
        fontSize: 16,
        color: "#333",
    },
});

export default Sidebar;
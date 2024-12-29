import React from "react";
import { View, StyleSheet } from "react-native";
// import Sidebar from "./Sidebar";

type CoordinatorLayoutProps = {
    children: React.ReactNode; // Redner the content of the active screen
};

const CoordinatorLayout: React.FC<CoordinatorLayoutProps> = ({ children }) => {
    return <View style={styles.content}>{children}</View>
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
    },
    content: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        padding: 16,
    },
});

export default CoordinatorLayout;
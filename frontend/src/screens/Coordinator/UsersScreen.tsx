import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/RootStackParamList";
import { CoordinatorStackParamList } from "@/src/navigation/CoordinatorStackParamList";

const UsersScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<CoordinatorStackParamList>>();
        const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Users</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "black",
    }
});

export default UsersScreen;
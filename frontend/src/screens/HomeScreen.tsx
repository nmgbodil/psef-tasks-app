import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { removeToken } from "../utils/auth_storage";

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleLogout = async () => {
        try {
            await removeToken();
            navigation.replace("SignIn");
        }
        catch (error) {
            Alert.alert("Error");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Home</Text>
            <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.link}>Log out</Text>
            </TouchableOpacity>
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
    },
    link: {
        fontSize: 14,
        color: "blue",
        textDecorationLine: "underline",
    }
});

export default HomeScreen;
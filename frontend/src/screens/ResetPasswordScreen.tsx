import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRoute, RouteProp, useNavigation, NavigationProp } from "@react-navigation/native";

import { reset_password } from "../services/auth_api_services";
import { RootStackParamList } from "../navigation/RootStackParamList";
import { gold } from "../utils/colors";

const ResetPasswordScreen: React.FC = () => {
    const route = useRoute<RouteProp<RootStackParamList, "ResetPassword">>();
    const { resetToken } = route.params;
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [new_password, setNewPassword] = useState<string>("");
    const [confirm_password, setConfirmPassword] = useState<string>("");

    const handleResetPassword = async () => {
        if (new_password?.length == 0 || confirm_password?.length == 0) {
            Alert.alert("Error", "Please enter all required information.");
            return;
        }

        if (new_password !== confirm_password) {
            Alert.alert("Error", "Passwords must match");
            return;
        }

        try {
            const data = await reset_password(resetToken, new_password);
            
            if (data.message === "Your password has successfully been reset") {
                navigation.replace("SignIn");
            }
        }
        catch (error: any) {
            if (error.error) {
                switch (error.error) {
                    case "Password cannot be the same as your last password":
                        Alert.alert("Error", "Password cannot be the same as your last password");
                        break;
                    case "This link is either invalid or has expired":
                        Alert.alert("Error", "This link is either invalid or has expired.");
                        break;
                    case "This account has not been verified":
                        Alert.alert("Error", "Your account has not been verified. Check your email.");
                        break;
                    default:
                        Alert.alert("Error", error.error);
                        break;
                }
            }
            else {
                Alert.alert("Error", "Something went wrong. Please try again later.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In</Text>
            <TextInput
                placeholder="Password"
                placeholderTextColor="#A0A0A0"
                value={new_password}
                onChangeText={setNewPassword}
                style={styles.input}
                secureTextEntry
            />
            <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#A0A0A0"
                value={confirm_password}
                onChangeText={setConfirmPassword}
                style={styles.input}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
            <View style={styles.login_row}>
                <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
                    <Text style={styles.link}>Log in</Text>
                </TouchableOpacity>
            </View>
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
        color: "#000000",
        marginBottom: 20,
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#D1D1D1",
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        marginBottom: 16,
        color: "#000000",
    },
    button: {
        width: "100%",
        backgroundColor: `${gold}`,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    login_row: {
        flexDirection: "row",
        marginTop: 12,
    },
    link: {
        fontSize: 14,
        color: "blue",
        textDecorationLine: "underline",
    }
});

export default ResetPasswordScreen;
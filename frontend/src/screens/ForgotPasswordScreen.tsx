import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";

import { forgot_password } from "../services/auth_api_services";
import { RootStackParamList } from "../navigation/RootStackParamList";
import { gold } from "../utils/colors";

const ForgotPasswordScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState<string>("");

    const handleForgotPassword = async () => {
        if(!email) {
            Alert.alert("Error", "Please enter an email.");
            return;
        }

        try {
            const data = await forgot_password(email);

            if (data.message === "Password reset email sent") {
                Alert.alert("", "Password reset email sent")
                return;
            }
        }
        catch (error: any) {
            if (error.error) {
                switch (error.error) {
                    case "This account owner does not exist":
                        Alert.alert("Error", "The account with this email address does not exist.");
                        break;
                    case "This account has not been verified":
                        Alert.alert("Error", "This account has not been verified. Verify it through the link sent to your email.");
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
            <Text style={styles.title}>Let's make sure it's you</Text>
            <TextInput
                placeholder="Email"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
                <Text style={styles.buttonText}>Send Password Reset Email</Text>
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

export default ForgotPasswordScreen;
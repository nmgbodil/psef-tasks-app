import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { saveToken } from "../utils/auth_storage";
import { login } from "../services/auth_api_services"
import { RootStackParamList } from "../navigation/types";

const SignInScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        try {
            const data = await login(email, password);
            
            if (data.message === "Welcome to your profile") {
                const access_token = data.access_token;
                await saveToken(access_token);
                navigation.replace("Home");
            }
        }
        catch (error: any) {
            if (error.error) {
                switch (error.error) {
                    case "This account owner does not exist":
                        Alert.alert("Error", "The account does not exist. Please register first");
                        break;
                    case "Incorrect password":
                        Alert.alert("Error", "The password you entered is incorrect. Try again.");
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
                Alert.alert("Error", "Something went wrong. Please try again.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In</Text>
            <TextInput
                placeholder="Email"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                <Text style={styles.buttonText}>Sign In</Text>
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
        backgroundColor: "#CFB53B",
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
});

export default SignInScreen;
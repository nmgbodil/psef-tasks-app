import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { register } from "../services/auth_api_services";
import { RootStackParamList, UserData } from "../navigation/types";

const SignUpScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [first_name, setFirstName] = useState<string>("");
    const [last_name, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirm_password, setConfirmPassword] = useState<string>("");

    const handleSignUp = async () => {
        if (!first_name || !last_name || !email || !password || !confirm_password) {
            Alert.alert("Error", "Please fill out all required information");
            return;
        }

        if (password !== confirm_password) {
            Alert.alert("Error", "Passwords must match");
            return;
        }

        const userData: UserData = { first_name, last_name, email, password };

        try {
            const data = await register(userData);

            if (data.message === "User registered successfully. Prompt to verify email.") {
                navigation.replace("SignIn");
            }
        }
        catch (error: any) {
            if (error.error) {
                switch (error.error) {
                    case "User already exists":
                        Alert.alert("Error", "There is already a user registered with this email.");
                        break;
                    case "Error sending verification email":
                        Alert.alert("Error", "An error occurred while sending verification email. Please try logging in in a few minutes.");
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
                    <Text style={styles.title}>Sign Up</Text>
                    <TextInput
                        placeholder="First Name"
                        placeholderTextColor="#A0A0A0"
                        value={first_name}
                        onChangeText={setFirstName}
                        style={styles.input}
                        keyboardType="default"
                        autoCapitalize="words"
                    />
                    <TextInput
                        placeholder="Last Name"
                        placeholderTextColor="#A0A0A0"
                        value={last_name}
                        onChangeText={setLastName}
                        style={styles.input}
                        keyboardType="default"
                        autoCapitalize="words"
                    />
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
                    <TextInput
                        placeholder=" Confirm Password"
                        placeholderTextColor="#A0A0A0"
                        value={confirm_password}
                        onChangeText={setConfirmPassword}
                        style={styles.input}
                        secureTextEntry
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                    <View style={styles.login_row}>
                        <Text style={styles.text}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
                            <Text style={styles.link}> Sign In</Text>
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
    login_row: {
        flexDirection: "row",
        marginTop: 12,
    },
    text: {
        fontSize: 14,
        color: "#000000",
    },
    link: {
        fontSize: 14,
        color: "blue",
        textDecorationLine: "underline",
    }
});

export default SignUpScreen;
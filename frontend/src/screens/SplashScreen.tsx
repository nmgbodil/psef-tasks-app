import React, { useEffect } from "react"
import { View, StyleSheet, Animated } from "react-native";
import { getToken } from "../utils/auth_storage";

// SplashScreen component with navigation prop
const SplashScreen = ({ navigation }: any) => {
    const fadeAnim = new Animated.Value(1); //Initial opacity set to fully visible

    useEffect(() => {
        // Start the fade-out animation when the component mounts
        Animated.timing(fadeAnim, {
            toValue: 0, // Final opacity set to completely invisible
            duration: 2000, // Duration of the animation
            useNativeDriver: true // Optimize animation performance
        }).start(() => {
            // Callback after the animation finishes
            checkAuthStatus();
        });
    }, [])

    // Function check user's authentication status
    const checkAuthStatus = async () => {
        const token = await getToken(); // Check for user login token
        if (token) {
            navigation.replace("CoordinatorNavigator")
        }
        else {
            navigation.replace("SignIn");
        }
    };

    return (
        // Contain for the splash screen
        <View style={styles.container}>
            <Animated.Image
                source={require("../assets/images/psef_logo.png")}
                style={[styles.logo, { opacity: fadeAnim }]}
            />
        </View>
    );
};

// Stylesheet for styling the SplashScreen
const styles = StyleSheet.create({
    container: {
        flex: 1, // Take up the full screen
        justifyContent: "center", // Center content vertically
        alignItems: "center", // Center content horizontally
        backgroundColor: "#FFFFFF" // White background
    },
    logo: {
        width: 200,
        height: 200,
    },
});

export default SplashScreen;
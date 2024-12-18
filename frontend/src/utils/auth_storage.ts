import AsyncStorage from "@react-native-async-storage/async-storage";

// Save the authentication token to AsyncStorage
export const saveToken = async (token: string): Promise<void> =>{
    try {
        await AsyncStorage.setItem("authToken", token);
    }
    catch (error) {
        console.error("Error saving token to AsyncStorage:", error);
    }
};

// Retrieve the authentication token from AsyncStorage
export const getToken = async (): Promise<string | null> => {
    try {
        const token = await AsyncStorage.getItem("authToken");
        return token; // Returns the toekn or null if not found
    }
    catch (error) {
        console.error("Error retrieving token form AsyncStorage:", error);
        return null;
    }
};

// Remove the authentication token (used during logout)
export const removeToken = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem("authToken");
    }
    catch (error) {
        console.error("Error removing token from AsyncStorage:", error);
    }
};
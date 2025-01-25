import { CommonActions } from "@react-navigation/native";
import axios, { AxiosError } from "axios";

import { API_BASE_URL } from "../constants/api_constants";
import { removeToken } from "../utils/auth_storage";
import { navigation } from "../navigation/RootStackParamList";

// Axios instance with default configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json", // Default headers
    },
});

// Axios response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // Check for expired access tokens
        if (error.response?.status === 401) {
            console.error("Token expired, redirecting to login...");
            // Remove the expired token
            await removeToken();

            // Redirect to the login page
            if (navigation) {
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: "SignIn" }],
                    })
                );
            }
            else {
                console.error("Navigation object is not set!");
            }
        }
        // Check if user exists
        else if (error.response?.status === 403 && error.response?.data?.error === "Account deleted") {
            console.error("This user does not exist, redirecting to signup...");
            // Remove access token
            await removeToken();

            // Redirect to the signup page
            if (navigation) {
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: "SignUp" }],
                    })
                );
            }
            else {
                console.error("Navigation object is not set!");
            }
        }
        return Promise.reject(error); // Reject the error so the calling code can handle it
    }
);

// Helper functions for API calls
export const signup_task = async (access_token: string, task_id: string) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`
        const response = await apiClient.post("tasks/user/signup", { task_id });
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Signup Task API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
};

export const drop_task = async (access_token: string, assignment_id: string) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`
        const response = await apiClient.delete(`tasks/user/drop_task/${assignment_id}`);
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Drop Task API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
};

export const get_my_tasks = async (access_token: string) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`
        const response = await apiClient.get(`tasks/user/my_tasks`);
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Get User Tasks API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
};
import axios, { AxiosError } from "axios";
import { UserData } from "../navigation/types";

const API_BASE_URL = "http://172.20.10.9:5000/api/v1"; // Get actual url when pushed to production

// Axios instance with default configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json", // Default headers
    },
})

// Helper functions for API calls
export const register = async (userData: UserData) => {
    try {
        const response = await apiClient.post("auth/register", userData);
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Register API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
}

export const login = async (email: string, password: string) => {
    try {
        const response = await apiClient.post("auth/login", {
        email,
        password,
        });
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Login API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
};

export const reset_password = async (reset_token: string, newPassword: string) => {
    try {
        const response = await apiClient.post(`auth/reset_password/${reset_token}`, { password: newPassword });
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Verification API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred"};
    }
};

export const forgot_password = async (email: string) => {
    try {
        const response = await apiClient.post("auth/forgot_password", {email});
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Forgot password API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosrror: "Unknown error occurred" };
    }
}
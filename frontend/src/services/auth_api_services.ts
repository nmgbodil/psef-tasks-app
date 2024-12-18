import axios, { AxiosError } from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1"; // Get actual url when pushed to production

// Axios instance with default configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json", // Default headers
    },
})

// Helper functions for API calls
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
        throw axiosError.response?.data || { axiosError: "Unknown error occured" };
    }
};

export const register = async (userData: { email: string; password: string; first_name: string; last_name: string}) => {
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
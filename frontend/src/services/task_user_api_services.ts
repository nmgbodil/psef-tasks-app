import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "../constants/api_constants";

// Axios instance with default configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json", // Default headers
    },
});

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
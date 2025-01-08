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
export const fetch_user_data = async (access_token: string) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        const response = await apiClient.get("tasks/my_user");
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Get User API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
};

export const get_all_tasks = async (access_token: string) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        const response = await apiClient.get("tasks/all_tasks");
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Get All Tasks API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
};

export const get_my_pending_tasks = async (access_token: string) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        const response = await apiClient.get("tasks/my_pending_tasks");
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Get User Pending Tasks API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
};

export const update_status = async (access_token: string, assignment_id: string, status: string) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        const response = await apiClient.patch(`tasks/update_status/${assignment_id}`, { status });
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Update Task Status API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
};
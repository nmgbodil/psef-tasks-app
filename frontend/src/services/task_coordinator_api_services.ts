import { CommonActions } from "@react-navigation/native";
import axios, { AxiosError } from "axios";

import { TaskData } from "../utils/types";
import { API_BASE_URL } from "../constants/api_constants";
import { removeToken } from "../utils/auth_storage";
import { navigation } from "../navigation/RootStackParamList";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json", // Default headers
    },
});

// Axios response interceptor for expired tokens
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.error("Token expired, redirecting to login...");
            // Remove the expired token
            await removeToken();

            //Redirect to the login page
            if (navigation) {
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: "SignIn"}]
                    })
                );
            }
            else {
                console.error("Navigation object is not set!");
            }
        }
        return Promise.reject(error); // Reject the error so the calling code can handle it
    }
)

// Helper functions for API calls
export const get_all_users = async (access_token: string) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        const response = await apiClient.get("tasks/coordinator/all_users");
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Get All Users API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
};

export const create_task = async (access_token: string, task: TaskData) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        const response = await apiClient.post("tasks/coordinator/create", task);
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Create Task API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
};

export const assign_task = async (access_token: string, assignee_id: string, task_id: string) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        const response = await apiClient.post("tasks/coordinator/assign", {assignee_id, task_id});
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Assign Task API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
};

export const delete_task = async (access_token: string, task_id: string) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        const response = await apiClient.delete(`tasks/coordinator/delete_task/${task_id}`);
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Delete Task API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
};

export const delete_assignment = async (access_token: string, assignment_id: string) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        const response = await apiClient.delete(`tasks/coordinator/delete_assignment/${assignment_id}`);
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Delete Assignment API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
};

export const update_task = async (access_token: string, task: TaskData, task_id: string) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        const response = await apiClient.patch(`tasks/coordinator/update_task/${task_id}`, task);
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Update Task API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred"};
    }
};

export const update_assignment = async (access_token: string, assignment_id: string, assignee_id: string) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        const response = await apiClient.patch(`tasks/coordinator/update_assignment/${assignment_id}`, { assignee_id });
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Update Assignment API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred"};
    }
};
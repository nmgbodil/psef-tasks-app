import axios, { AxiosError } from "axios";
import { TaskData } from "../navigation/types";
import { API_BASE_URL } from "../constants/api_constants";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json", // Default headers
    },
});

// Helper functions for API calls
export const get_all_tasks = async (access_token: string) => {
    try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        const response = await apiClient.get("tasks/coordinator/all_assignments");
        return response.data;
    }
    catch (error) {
        const axiosError = error as AxiosError;
        console.error("Get All Tasks API Error:", axiosError.response?.data || axiosError.message);
        throw axiosError.response?.data || { axiosError: "Unknown error occurred" };
    }
};

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
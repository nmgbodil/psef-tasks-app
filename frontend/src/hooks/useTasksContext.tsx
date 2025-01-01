import React, { createContext, ReactNode, useContext, useState } from "react";
import { getToken } from "../utils/auth_storage";
import { get_all_tasks } from "../services/task_coordinator_api_services";

interface TasksContextType {
    tasks: {
        message: string;
        sorted_tasks: string[];
        assignments: {
            [key: string]: {
                task_name: string;
                description: string;
                start_time: string;
                end_time: string;
                users: {
                    user_id: string;
                    first_name: string;
                    last_name: string;
                    assignment_id: number;
                }[]
            }
        };
    };
    getAllTasks: () => Promise<void>;
}

interface TasksProviderProps {
    children: ReactNode;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }: any) => {
    const [tasks, setTasks] = useState<any>({});

    const getAllTasks = async () => {
        try {
            const access_token = await getToken();
            if (access_token) {
                const data = await get_all_tasks(access_token);

                if (data?.message === "Assignments successfully retrieved") {
                    setTasks(data);
                }
            }
        }
        catch (error) {
            console.error("Error fetching tasks:", error)
        }
    };

    return (
        <TasksContext.Provider value={{ tasks, getAllTasks }}>
            {children}
        </TasksContext.Provider>
    );
};

export const useTasks = (): TasksContextType => {
    const context = useContext(TasksContext);
    if (!context) {
        throw new Error("useTasks must be used within a TasksProvider");
    }
    return context;
};
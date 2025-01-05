import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from "../utils/auth_storage";
import { get_all_tasks } from "../services/task_api_services";
import { BACKEND_URL } from "../constants/api_constants";

interface TasksContextType {
    tasks: {
        message: string;
        sorted_tasks: string[];
        tasks: {
            [key: string]: {
                task_name: string;
                task_type: string;
                max_participants: number | null;
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
    const [socket, setSocket] = useState<Socket | null>(null);

    const getAllTasks = async () => {
        try {
            const access_token = await getToken();
            if (access_token) {
                const data = await get_all_tasks(access_token);

                if (data?.message === "Tasks successfully retrieved") {
                    setTasks(data);
                }
            }
        }
        catch (error) {
            console.error("Error fetching tasks:", error)
        }
    };

    // Establish WebSocket connection
    useEffect(() => {
        const newSocket = io(BACKEND_URL, { transports: ["websocket"] });
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    // Listen for 'tasks_updated' WebSocket event
    useEffect(() => {
        if (socket) {
            socket.on("tasks_updated", (updatedTasks: any) => {
                console.log("Received updated tasks");
                setTasks(updatedTasks); // Updated the tasks state with new data
            });
        }

        return () => {
            if (socket) {
                socket.off("tasks_updated");
            }
        };
    }, [socket])

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
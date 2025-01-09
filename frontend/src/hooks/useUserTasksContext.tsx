import React, { createContext, ReactNode, useContext, useState } from "react";
import { get_my_tasks } from "../services/task_user_api_services";
import { getToken } from "../utils/auth_storage";

interface UserTasksContextType {
    userTasks: {
        message: string;
        user_tasks: [
            {
                task_id: string;
                assignment_id: string
                task_name: string;
                task_type: string;
                max_participants: number | null;
                description: string;
                start_time: string;
                end_time: string;
            }
        ];
    };
    getUserTasks: () => Promise<void>;
    loading: boolean;
};

interface UserTasksProviderProps {
    children: ReactNode;
};

const UserTasksContext = createContext<UserTasksContextType | undefined>(undefined);

export const UserTasksProvider: React.FC<UserTasksProviderProps> = ({ children }: any) => {
    const [userTasks, setUserTasks] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(true);
    
    const getUserTasks = async () => {
        try {
            const access_token = await getToken();
            if (access_token) {
                const data = await get_my_tasks(access_token);

                if (data?.message === "User tasks successfully retrieved") {
                    setUserTasks(data);
                }
            }
        }
        catch (error) {
            console.error("Error fetching user tasks", error);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <UserTasksContext.Provider value={{ userTasks, getUserTasks, loading }}>
            {children}
        </UserTasksContext.Provider>
    );
};

export const useUserTasks = (): UserTasksContextType => {
    const context = useContext(UserTasksContext);
    if (!context) {
        throw new Error("useUserTasks must be used within a UserTasksProvider");
    }
    return context;
};
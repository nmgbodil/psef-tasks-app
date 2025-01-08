import React, { createContext, ReactNode, useContext, useState } from "react";
import { getToken } from "../utils/auth_storage";
import { get_all_users } from "../services/task_coordinator_api_services";
import { UserData, UserRole } from "../utils/types";

interface UsersContextType {
    users: {
        user_id: string;
        first_name: string;
        last_name: string;
        email: string;
        role: UserRole;
    }[];
    getAllUsers: () => Promise<void>;
};

interface UsersProviderProps {
    children: ReactNode;
};

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<UsersProviderProps> = ({ children }: any) => {
    const [users, setUsers] = useState<any>([]);

    const getAllUsers = async () => {
        try {
            const access_token = await getToken();
            if (access_token) {
                const data = await get_all_users(access_token);

                if (data?.message == "Users successfully retrieved") {
                    setUsers(data?.users.map((user: UserData) => ({
                        label: `${user.first_name} ${user.last_name}`,
                        value: user.user_id
                    })));
                }
            }
        }
        catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    return (
        <UsersContext.Provider value={{ users, getAllUsers}}>
            {children}
        </UsersContext.Provider>
    );
};

export const useUsers = (): UsersContextType => {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error("useUsers must be used with a UsersProvider");
    }
    return context;
};
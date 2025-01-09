import React, { createContext, ReactNode, useContext, useState } from "react";

import { UserRole } from "../utils/types";
import { getToken } from "../utils/auth_storage";
import { fetch_user_data } from "../services/task_api_services";

interface UserDataContextType {
    userData: {
        message: string;
        user: {
            user_id: string;
            first_name: string;
            last_name: string;
            email: string;
            role: UserRole
        };
    };
    getUserData: () => Promise<void>;
};

interface UserDataProviderProps {
    children: ReactNode;
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }: any) => {
    const [userData, setUserData] = useState<any>({});

    const getUserData = async () => {
        try {
            const access_token = await getToken();
            if (access_token) {
                const data = await fetch_user_data(access_token);

                if (data.message === "User data successfully retrieved") {
                    setUserData(data);
                }
            }
        }
        catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    return (
        <UserDataContext.Provider value={{ userData, getUserData }}>
            {children}
        </UserDataContext.Provider>
    );
};

export const useUserData = (): UserDataContextType => {
    const context = useContext(UserDataContext);
    if (!context) {
        throw new Error("useUsersData must be used with a UserDataProvider");
    }
    return context;
};
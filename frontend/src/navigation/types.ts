import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Profile: undefined;
    Tasks: undefined;
    Users: undefined;
    Dashboard: undefined;
    SignIn: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
    ResetPassword: { resetToken: string };
};

export type CoordinatorStackParamList = {
    Sidebar: undefined;
    TaskDetails: { task_id: string };
    AssignTask: {
        task_id: string;
        user_data: {
            user_id: string;
            first_name: string;
            last_name: string;
            assignment_id: number;
        }
    };
};

export type TaskDetailsProps = NativeStackScreenProps<CoordinatorStackParamList, "TaskDetails">;
export type TaskMenuProps = NativeStackScreenProps<CoordinatorStackParamList, "AssignTask">;

export interface UserData {
    user_id: string | null
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    password: string | null;
    role: UserRole | null;
};

export enum UserRole {
    User = "User",
    Coordinator = "Coordinator",
};

export interface TaskData {
    task_id: number | null;
    task_name: string | null;
    task_type: string | null;
    description: string | null;
    users: UserData[] | null;
    start_time: Date | null;
    end_time: Date | null;
    max_participants: number | null;
    status: TaskStatus | null;
};

export enum TaskStatus {
    Pending = "Pending",
    Complete = "Complete",
    Incomplete = "Incomplete"
};
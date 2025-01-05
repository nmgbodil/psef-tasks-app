import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Splash: undefined;
    SignIn: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
    ResetPassword: { resetToken: string };
    SearchTask: { title: string };
    CoordinatorNavigator: {
        screen: string;
        params: any;
    } | undefined;
    UserNavigator: {
        screen: string;
        params: any;
    } | undefined;
};

export type SearchTaskProps = NativeStackScreenProps<RootStackParamList, "SearchTask">;

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
        } | null;
    };
    UpdateTask: {
        task_id: string;
        user_data: {
            user_id: string;
            first_name: string;
            last_name: string;
            assignment_id: number;
        } | null;
    };
    UpdateAssignment: {
        task_id: string;
        user_data: {
            user_id: string;
            first_name: string;
            last_name: string;
            assignment_id: number;
        } | null;
    };
    CreateTask: undefined;
};

export type TaskDetailsProps = NativeStackScreenProps<CoordinatorStackParamList, "TaskDetails">;
export type AssignTaskProps = NativeStackScreenProps<CoordinatorStackParamList, "AssignTask">;
export type UpdateTaskProps = NativeStackScreenProps<CoordinatorStackParamList, "UpdateTask">;
export type UpdateAssignmentProps = NativeStackScreenProps<CoordinatorStackParamList, "UpdateAssignment">;

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
    start_time: string | null;
    end_time: string | null;
    max_participants: number | null;
    status: TaskStatus | null;
};

export enum TaskStatus {
    Pending = "Pending",
    Complete = "Complete",
    Incomplete = "Incomplete"
};

export type ConfirmModalProps = {
    visible: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
};
import { NativeStackScreenProps } from "@react-navigation/native-stack";

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
    SearchTask: { title: string };
};

export type TaskDetailsProps = NativeStackScreenProps<CoordinatorStackParamList, "TaskDetails">;
export type AssignTaskProps = NativeStackScreenProps<CoordinatorStackParamList, "AssignTask">;
export type UpdateTaskProps = NativeStackScreenProps<CoordinatorStackParamList, "UpdateTask">;
export type UpdateAssignmentProps = NativeStackScreenProps<CoordinatorStackParamList, "UpdateAssignment">;
export type SearchTaskProps = NativeStackScreenProps<CoordinatorStackParamList, "SearchTask">;
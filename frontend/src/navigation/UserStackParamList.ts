import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type UserStackParamList = {
    Sidebar: undefined;
    TaskDetails: {
        task_id: string;
        assignment_id: string | null;
    };
    SearchTask: { title: string};
};

export type TaskDetailsProps = NativeStackScreenProps<UserStackParamList, "TaskDetails">;
export type SearchTaskProps = NativeStackScreenProps<UserStackParamList, "SearchTask">;
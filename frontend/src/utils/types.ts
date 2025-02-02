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
};

export enum TaskStatus {
    Pending = "Pending",
    Completed = "Completed",
    Incompleted = "Incompleted"
};

export interface Assignment {
    assignment_id: string | null;
    task_id: string | null;
    task_name: string | null;
    task_type: string | null;
    description: string | null;
    max_participants: number | null;
    start_time: string | null;
    end_time: string | null;
};
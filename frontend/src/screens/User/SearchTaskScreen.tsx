import React, { useEffect, useState } from "react";
import { View, Button, SafeAreaView, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { format } from 'date-fns';

import DropDownPicker from "react-native-dropdown-picker";
import ConfirmModal from "../../components/ConfirmModal";
import { getToken } from "../../utils/auth_storage";
import { SearchTaskProps } from "../../navigation/UserStackParamList";
import { useTasks } from "../../hooks/useTasksContext";
import { useUserData } from "@/src/hooks/useUserDataContext";
import { drop_task, signup_task } from "@/src/services/task_user_api_services";
import { useUserTasks } from "@/src/hooks/useUserTasksContext";
import { RootStackParamList } from "@/src/navigation/RootStackParamList";
import { monthDisplay } from "@/src/utils/format";
import { gold } from "@/src/utils/colors";

const SearchTaskScreen = ({route, navigation}: SearchTaskProps) => {
    const { title } = route.params;
    const { tasks } = useTasks();
    const { userData } = useUserData();
    const { getUserTasks } = useUserTasks();
    const [formatted_tasks, setFormattedTasks] = useState<any>([]);
    const [selected_task, setSelectedTask] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<{ [key: string]: boolean }>({"task": false});
    const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();

    const openModal = (adj: string) => {
        setIsModalVisible((prev) => ({ ...prev, [adj]: true}));
    };
    const closeModal = (adj: string) => {
        setIsModalVisible((prev) => ({ ...prev, [adj]: false}));
    };

    const confirmDropTask = async () => {
        closeModal("task");
        try {
            const access_token = await getToken();
            if (access_token) {
                const user = tasks?.tasks[selected_task]?.users.find(user => user.user_id === userData?.user?.user_id);
                if (user) {
                    const data = await drop_task(access_token, user?.assignment_id);

                    if (data.message === "Task successfully dropped") {
                        await getUserTasks();
                        Alert.alert("Success", "Task successfully dropped");
                        return;
                    }
                }
                else {
                    Alert.alert("", "You must be assigned to the task first");
                }

            }
            else {
                parentNavigation.navigate("SignIn");
                return;
            }
        }
        catch (error: any) {
            Alert.alert("Error", error?.error);
        }
    };

    const cancelDropTask = () => {
        closeModal("task")
    };

    const actionTitle = {
        "Sign up for a task": "sign up for",
        "Drop a task": "drop"
    };

    useEffect(() => {
        const format_tasks = () => {
            setFormattedTasks(tasks?.sorted_tasks.map((task_id) => {
                const task = tasks?.tasks[task_id.toString()];
                const day = format(new Date(task?.start_time), "d");
                const month = format(new Date(task?.start_time), "MM");
                const start_time = format(new Date(task?.start_time), "HH:mm");
                const end_time = format(new Date(task?.end_time), "HH:mm");

                return {
                    label: `${task?.task_name} (${task?.description}), ${day} ${monthDisplay[month]} @ ${start_time} - ${end_time}`,
                    value: task_id
                }
            }));
        };

        format_tasks();
    }, [tasks]);

    const handleSignUpTask = async () => {
        try {
            const access_token = await getToken();
            if (access_token) {
                const data = await signup_task(access_token, selected_task);

                if (data.message === "Assignment has been successfully created") {
                    await getUserTasks();
                    Alert.alert("Success", "You have signed up for this task");
                }
            }
            else {
                parentNavigation.navigate("SignIn");
            }
        }
        catch (error: any) {
            handleError(error);
        }
    };

    const handleError = (error: any) => {
        if (error.error) {
            switch (error.error) {
                case "Assignment already exists":
                    Alert.alert("Conflict", "You have already been assigned to this task");
                    break;
                case "Task doer not free at this time":
                    Alert.alert("Conflict", "You are currently not free to sign up for this task");
                    break;
                case "Maximum particpants reached":
                    Alert.alert("Conflict", "Maximum number of participants for this task has been reached");
                    break;
                case "Unauthorized":
                    Alert.alert("Error", "This account is unauthorized for this action");
                    break;
                default:
                    Alert.alert("Error", error.error);
                    break;
            }
        }
    };

    const handleTaskDetailsPress = () => {
        if (selected_task) {
            const user = tasks?.tasks[selected_task]?.users.find(user => user.user_id === userData?.user?.user_id);

            if (user) {
                navigation.navigate("TaskDetails", { task_id: selected_task, assignment_id: user?.assignment_id });
            }
            else {
                navigation.navigate("TaskDetails", { task_id: selected_task, assignment_id: null})
            }
        }
        else {
            Alert.alert("", "Please select a task first");
        }
    };

    const handleSubmit = () => {
        if (selected_task) {
            if (title === "Drop a task") {
                openModal("task");
            }
            else {
                handleSignUpTask();
            }
        }
        else {
            Alert.alert("", "Please select a task first");
        }
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>
                <View style={styles.topRow}>
                    <Button title="← Back" color={`${gold}`} onPress={() => navigation.goBack()} />
                    <Button title="Go" color={`${gold}`} onPress={handleSubmit} />
                </View>
                <Text style={styles.title}>Search Task</Text>
                <View style={styles.DataEntry}>
                    <Text style={styles.text}>Choose a task to {actionTitle[title]}</Text>
                    <DropDownPicker
                        open={open}
                        value={selected_task}
                        items={formatted_tasks}
                        setOpen={setOpen}
                        setValue={setSelectedTask}
                        placeholder="Select a task..."
                        style={styles.dropDown}
                        dropDownContainerStyle={styles.dropDownContainer}
                        textStyle={styles.dropDownText}
                        placeholderStyle={styles.placeHolderStyle}
                        searchable
                        searchPlaceholder="Search tasks..."
                        searchTextInputStyle={styles.searchText}
                        searchContainerStyle={styles.searchContainer}
                    />
                </View>
                <TouchableOpacity style={styles.button} onPress={handleTaskDetailsPress}>
                    <Text style={styles.buttonText}>See task details</Text>
                </TouchableOpacity>
                <ConfirmModal
                    visible={isModalVisible["task"]}
                    message="Are you sure you want to drop this task?"
                    onConfirm={confirmDropTask}
                    onCancel={cancelDropTask}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "#ffffff"
    },
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        padding: 16,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
    },
    DataEntry: {
        marginTop: 20
    },
    text: {
        fontSize: 16,
        color: "#000",
        fontWeight: "bold",
    },
    dropDown: {
        backgroundColor: "#FFFFFF",
        borderColor: "#ccc",
        borderWidth: 1,
    },
    dropDownContainer: {
        backgroundColor: "#FFFFFF",
        borderColor: "#ccc",
    },
    dropDownText: {
        color: "black",
        fontSize: 16,
    },
    placeHolderStyle: {
        color: "#888",
    },
    searchText: {
        color: "black",
        fontSize: 16,
    },
    searchContainer: {
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
    },
    button: {
        width: "30%",
        backgroundColor: `${gold}`,
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: "center",
        marginTop: 12,
        alignSelf: "center"
    },
    buttonText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
});

export default SearchTaskScreen;
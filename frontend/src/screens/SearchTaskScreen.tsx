import React, { useEffect, useState } from "react";
import { Button, SafeAreaView, Text, StyleSheet, Alert } from "react-native";
import { SearchTaskProps } from "../utils/types";
import { useTasks } from "../hooks/useTasksContext";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import ConfirmModal from "../components/ConfirmModal";
import { getToken } from "../utils/auth_storage";
import { delete_task } from "../services/task_coordinator_api_services";

const SearchTaskScreen = ({route, navigation}: SearchTaskProps) => {
    const { title } = route.params;
    const { tasks } = useTasks();
    const [formatted_tasks, setFormattedTasks] = useState<any>([]);
    const [selected_task, setSelectedTask] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<{ [key: string]: boolean }>({"task": false});

    const openModal = (adj: string) => {
        setIsModalVisible((prev) => ({ ...prev, [adj]: true}));
    };
    const closeModal = (adj: string) => {
        setIsModalVisible((prev) => ({ ...prev, [adj]: false}));
    }

    const confirmDeleteTask = async () => {
        closeModal("task");
        try {
            const access_token = await getToken();
            if (access_token) {
                const data = await delete_task(access_token, selected_task);

                if (data.message === "Task successfully deleted") {
                    Alert.alert("Success", "Task successfully deleted");
                    navigation.navigate("CoordinatorNavigator");
                    return;
                }
            }
            else {
                navigation.navigate("SignIn");
                return;
            }
        }
        catch (error: any) {
            Alert.alert("Error", error?.error);
        }
    };

    const cancelDeleteTask = () => {
        closeModal("task")
    };

    const actionTitle = {
        "Assign task": "assign",
        "Delete task": "delete"
    };

    useEffect(() => {
        const format_tasks = () => {
            setFormattedTasks(tasks?.sorted_tasks.map((task_id) => ({
                label: `${tasks?.tasks[task_id.toString()]?.task_name} (${tasks?.tasks[task_id.toString()]?.description}) ${tasks?.tasks[task_id.toString()]?.start_time} - ${tasks?.tasks[task_id.toString()]?.end_time}`,
                value: task_id
            })));
        };

        format_tasks();
    }, [tasks]);

    const handleSubmit = () => {
        if (selected_task) {
            if (title === "Delete task") {
                openModal("task");
            }
            else {
                navigation.navigate("CoordinatorNavigator", {
                    screen: "AssignTask",
                    params: { task_id: selected_task, user_data: null}
                });
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
                    <Button title="← Back" color="#f0b44a" onPress={() => navigation.goBack()} />
                    <Button title="Go" color="#f0b44a" onPress={handleSubmit} />
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
                <ConfirmModal
                    visible={isModalVisible["task"]}
                    message="Are you sure you want to delete this task?"
                    onConfirm={confirmDeleteTask}
                    onCancel={cancelDeleteTask}
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
    }
});

export default SearchTaskScreen;
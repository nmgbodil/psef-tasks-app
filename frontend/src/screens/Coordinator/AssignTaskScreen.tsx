import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, FlatList, Alert } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { RootStackParamList, AssignTaskProps, UserRole } from "@/src/navigation/types";
import { getToken } from "@/src/utils/auth_storage";
import { assign_task } from "@/src/services/task_coordinator_api_services";
import { NavigationProp } from "@react-navigation/native";
import { useTasks } from "@/src/hooks/useTasksContext";
import { useUsers } from "@/src/hooks/useUsersContext";

const AssignTaskScreen = ({ route, navigation }: AssignTaskProps) => {
    const { task_id, user_data } = route.params;
    const { tasks, getAllTasks } = useTasks();
    const { users, getAllUsers } = useUsers();
    const task = tasks?.assignments[task_id.toString()];
    const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();

    const taskData = [
        {key: "Description", value: task?.description || "No description"},
        {key: "Start", value: task?.start_time ? new Date(task.start_time).toLocaleString() : "Not specified"},
        {key: "End", value: task?.end_time ? new Date(task.end_time).toLocaleString() : "Not specified"}
    ];

    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            await getAllUsers();
        };

        fetchUsers();
    }, [users, getAllUsers]);

    const handleError = (error: any) => {
        if (error.error) {
            switch (error.error) {
                case "Assignment already exists":
                    Alert.alert("Conflict", "This member is already assigned to this task");
                    break;
                case "Task doer not free at this time":
                    Alert.alert("Conflict", "This member is occupied at this time");
                    break;
                case "Maximum participants reached":
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

    const handleSubmit = async () => {
        try {
            const access_token = await getToken();
            if (selectedUser && access_token) {
                const data = await assign_task(access_token, selectedUser, task_id);
    
                if (data.message === "Assignment has been successfully created") {
                    Alert.alert("Success", "Assignment successfully created");
                    await getAllTasks();
                    navigation.goBack();
                }
            }
            else if (!selectedUser) {
                Alert.alert("", "Please select a user first");
            }
            else {
                parentNavigation.navigate("SignIn");
            }
        }
        catch (error: any) {
            handleError(error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <Button title="← Back" color="#f0b44a" onPress={() => navigation.goBack()} />
                <Button title="Done" color="#f0b44a" onPress={handleSubmit} />
            </View>
            <Text style={styles.title}>{task?.task_name}</Text>
            <View style={styles.taskDataContainer}>
                <FlatList
                data={taskData}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={styles.label}>{item.key}</Text>
                        <Text style={styles.value}>{item.value}</Text>
                    </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            </View>
            <View style={styles.DataEntry}>
                <Text style={styles.text}>Choose a member to assign to this task</Text>
                <DropDownPicker
                open={open}
                value={selectedUser}
                items={users}
                setOpen={setOpen}
                setValue={setSelectedUser}
                placeholder="Select a club member..."
                style={styles.dropDown}
                dropDownContainerStyle={styles.dropDownContainer}
                textStyle={styles.dropDownText}
                placeholderStyle={styles.placeHolderStyle}
                searchable
                searchPlaceholder="Search members..."
                searchTextInputStyle={styles.searchText}
                searchContainerStyle={styles.searchContainer}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        padding: 16,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginTop: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
    },
    taskDataContainer: {
        backgroundColor: "#f8f8f8",
        padding: 20,
        borderRadius: 15,
        width: "100%",
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    label: {
        fontSize: 16,
        color: "#333",
    },
    value: {
        fontSize: 16,
        color: "#666"
    },
    separator: {
        height: 1,
        backgroundColor: "#e0e0e0",
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

export default AssignTaskScreen;
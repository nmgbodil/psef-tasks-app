import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Alert, SafeAreaView } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { NavigationProp } from "@react-navigation/native";
import { format } from "date-fns";

import { getToken } from "@/src/utils/auth_storage";
import {  update_assignment } from "@/src/services/task_coordinator_api_services";
import { useTasks } from "@/src/hooks/useTasksContext";
import { useUsers } from "@/src/hooks/useUsersContext";
import { UpdateAssignmentProps } from "@/src/navigation/CoordinatorStackParamList";
import { RootStackParamList } from "@/src/navigation/RootStackParamList";
import { monthDisplay } from "@/src/utils/format";
import { gold } from "@/src/utils/colors";

const UpdateAssignmentScreen = ({ route, navigation }: UpdateAssignmentProps) => {
    const { task_id, user_data } = route.params;
    const { tasks } = useTasks();
    const { users, getAllUsers } = useUsers();
    const task = tasks?.tasks[task_id.toString()];
    const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();
    const assignment_id = user_data?.assignment_id?.toString();

    const day = format(new Date(task?.start_time), "d");
    const month = format(new Date(task?.start_time), "MM");
    const start_time = format(new Date(task?.start_time), "HH:mm");
    const end_time = format(new Date(task?.end_time), "HH:mm");

    const taskData = [
        {key: "Description", value: task?.description || "No description"},
        {key: "Category", value: task?.task_type || "No Category"},
        {key: "Start", value: task?.start_time ? `${day} ${monthDisplay[month]} @ ${start_time}` : "Not specified"},
        {key: "End", value: task?.end_time ? `${day} ${monthDisplay[month]} @ ${end_time}` : "Not specified"}
    ];

    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            await getAllUsers();
        };

        fetchUsers();
    }, []);

    const handleError = (error: any) => {
        if (error.error) {
            switch (error.error) {
                case "Assignment already exists":
                    Alert.alert("Conflict", "This member is already assigned to this task");
                    break;
                case "Task doer not free at this time":
                    Alert.alert("Conflict", "This member is occupied at this time");
                    break;
                case "Unauthorized":
                    Alert.alert("Error", "This account is unauthorized for this action");
                    break;
                case "Task doer does not exist":
                    Alert.alert("Error", "Task doer does not exist");
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
            if (selectedUser && access_token && assignment_id) {
                const data = await update_assignment(access_token, assignment_id, selectedUser);
    
                if (data.message === "Assignment successfully updated") {
                    Alert.alert("Success", "Assignment successfully updated");
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
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>
                <View style={styles.topRow}>
                    <Button title="← Back" color={`${gold}`} onPress={() => navigation.goBack()} />
                    <Button title="Done" color={`${gold}`} onPress={handleSubmit} />
                </View>
                <Text style={styles.title}>{task?.task_name}</Text>
                <View style={styles.taskDataContainer}>
                    {taskData.map((item, index) => (
                        <View key={index}>
                            <View style={styles.row}>
                                <Text style={styles.label}>{item.key}</Text>
                                <Text style={styles.value}>{item.value}</Text>
                            </View>
                            {index < taskData.length - 1 && (
                                <View style={styles.separator} />
                            )}
                        </View>
                    ))}
                    {task?.max_participants && (
                        <View>
                            <View style={styles.separator} />
                            <View style={styles.row}>
                                    <Text style={styles.label}>Maximum number of participants</Text>
                                    <Text style={styles.value}>{task?.max_participants}</Text>
                            </View>
                        </View>
                    )}
                </View>
                <View style={styles.DataEntry}>
                    <Text style={styles.text}>Choose a new member to reassign to this task</Text>
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
        marginTop:20
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

export default UpdateAssignmentScreen;
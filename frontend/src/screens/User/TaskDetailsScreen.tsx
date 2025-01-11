import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, FlatList, ScrollView, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import {Menu, IconButton } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { NavigationProp } from "@react-navigation/native";
import { format } from "date-fns";

import { useTasks } from "@/src/hooks/useTasksContext";
import ConfirmModal from "@/src/components/ConfirmModal";
import { getToken } from "@/src/utils/auth_storage";
import { RootStackParamList } from "@/src/navigation/RootStackParamList";
import { drop_task, signup_task } from "@/src/services/task_user_api_services";
import { TaskDetailsProps } from "@/src/navigation/UserStackParamList";
import { useUserTasks } from "@/src/hooks/useUserTasksContext";
import { monthDisplay } from "@/src/utils/format";
import { gold } from "@/src/utils/colors";

const TaskDetailsScreen = ({ route, navigation }: TaskDetailsProps) => {
    const [taskMenuVisible, setTaskMenuVisible] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const { task_id, assignment_id } = route.params;
    const { tasks, loading } = useTasks();
    const { getUserTasks } = useUserTasks();

    if (loading) {
        return <ActivityIndicator size="large" color={`${gold}`}/>;
    }

    const task = tasks?.tasks[task_id.toString()];
    const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();
    
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

    let taskMenuOptions;

    if (assignment_id) {
        const temp = [
            {id: "1", title: "Drop task", icon: "delete"}
        ];
        taskMenuOptions = temp;
    }
    else {
        const temp = [
            {id: "1", title: "Sign up", icon: "assignment-add"}
        ];
        taskMenuOptions = temp;
    }
    
    const openTaskMenu = () => setTaskMenuVisible(true);
    const closeTaskMenu = () => setTaskMenuVisible(false);

    const renderMenuOption = (item: { id: string; title: string; icon: string }) => (
        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOptionPress(item?.title)}>
            <MaterialIcons name={item.icon} size={20} style={styles.icon} color="black" />
            <Text style={styles.menuText}>{item.title}</Text>
        </TouchableOpacity>
    );

    const renderItem = (item: { user_id: string; first_name: string; last_name: string; assignment_id: number }) => (
        <View style={styles.listItem}>
            <Text style={styles.userName}>{item?.first_name} {item?.last_name}</Text>
        </View>
    );

    const handleMenuOptionPress = (title: string) => {
        closeTaskMenu();
        if (title === "Sign up") {
            handleSignUpTask();
        }
        else if (title === "Drop task") {
            openModal();
        }
    };

    const handleSignUpTask = async () => {
        try {
            const access_token = await getToken();
            if (access_token) {
                const data = await signup_task(access_token, task_id);

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

    const openModal = () => setIsModalVisible(true);
    const closeModal = () => setIsModalVisible(false);

    const confirmDropTask = async () => {
        closeModal();
        try {
            const access_token = await getToken();
            if (access_token && assignment_id) {
                const data = await drop_task(access_token, assignment_id);

                if (data.message === "Task successfully dropped") {
                    await getUserTasks();
                    Alert.alert("Success", "Task successfully dropped");
                    return;
                }
            }
            else if (access_token) {
                Alert.alert("Error", "Forbidden action");
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
        closeModal()
    };
    
    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>
                <View style={styles.topRow}>
                    <Button title="← Back" color={`${gold}`} onPress={() => navigation.goBack()} />
                    <Menu
                        visible={taskMenuVisible}
                        onDismiss={closeTaskMenu}
                        anchor={
                            <IconButton
                                icon="dots-horizontal-circle"
                                size={24}
                                onPress={openTaskMenu}
                                iconColor={`${gold}`}
                            />
                        }
                        style={styles.menuContainer}
                    >
                        <FlatList
                            data={taskMenuOptions}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => renderMenuOption(item)}
                        />
                    </Menu>
                </View>
                <Text style={styles.title}>{task?.task_name}</Text>
                <ScrollView>
                    <View style={styles.taskDataContainer}>
                        {taskData.map((item, index) => (
                            <View key={index}>
                                <View style={styles.row}>
                                    <Text style={styles.label}>{item.key}</Text>
                                    <Text style={styles.value}>{item.value}</Text>
                                </View>
                                {index < taskData.length - 1 && (
                                    <View style={styles.separator1} />
                                )}
                            </View>
                        ))}
                        {task?.max_participants && (
                            <View>
                                <View style={styles.separator1} />
                                <View style={styles.row}>
                                        <Text style={styles.label}>Maximum number of participants</Text>
                                        <Text style={styles.value}>{task?.max_participants}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                    {task?.users?.length > 0 ? (
                        task?.users && task?.users.map((item, index) => (
                            <React.Fragment key={item.user_id}>
                                {renderItem(item)}
                            {index < task?.users.length - 1 && (
                                <View style={styles.separator2} />
                            )}
                            </React.Fragment>
                        ))
                    ) : (
                        <Text style={styles.emptyMessage}>No one signed up for this task</Text>
                    )}
                </ScrollView>
                <ConfirmModal
                    visible={isModalVisible}
                    message="Are you sure you want to drop this task?"
                    onConfirm={confirmDropTask}
                    onCancel={cancelDropTask}
                />
            </View>
        </SafeAreaView>
    )
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
    menuContainer: {
        marginTop: 50,
    },
    menuItem: {
        backgroundColor: "rgba(211, 211, 211, 0.8)",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    menuText: {
        fontSize: 16,
        color: "black",
        marginLeft: 10,
    },
    icon: {
        margin: 0,
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
        marginTop: 20
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
    separator1: {
        height: 1,
        backgroundColor: "#e0e0e0",
    },
    listItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#ffffff",
        borderRadius: 8,
        height: 55
    },
    userName: {
        fontSize: 16,
        color: "#000",
        fontWeight: "bold",
    },
    optionsButton: {
        padding: 5,
    },
    separator2: {
        height: 1,
        backgroundColor: "#333",
        marginHorizontal: 12,
    },
    emptyMessage: {
        fontSize: 16,
        color: "#999",
        textAlign: "center",
        marginVertical: 20,
    }
});

export default TaskDetailsScreen;
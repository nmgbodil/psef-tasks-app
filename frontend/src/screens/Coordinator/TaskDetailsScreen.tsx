import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, FlatList, SectionList, ScrollView, SafeAreaView, Alert } from "react-native";
import {Menu, IconButton } from "react-native-paper";
import { useTasks } from "@/src/hooks/useTasksContext";
import { RootStackParamList, TaskDetailsProps } from "@/src/navigation/types";
import ConfirmModal from "@/src/components/ConfirmModal";
import { getToken } from "@/src/utils/auth_storage";
import { delete_assignment, delete_task } from "@/src/services/task_coordinator_api_services";
import { NavigationProp } from "@react-navigation/native";

const TaskDetailsScreen = ({ route, navigation }: TaskDetailsProps) => {
    const [userVisibleMenus, setUserVisibleMenus] = useState<{ [key: string]: boolean }>({});
    const [taskMenuVisible, setTaskMenuVisible] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState<{ [key: string]: boolean }>({"task": false, "assignment": false});
    const [assignment_deleted, setAssignmentDeleted] = useState<string>("0");
    const { task_id } = route.params;
    const { tasks, getAllTasks } = useTasks();
    const task = tasks?.assignments[task_id.toString()];
    const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();

    const taskData = [
        {key: "Description", value: task?.description || "No description"},
        {key: "Start", value: task?.start_time ? new Date(task.start_time).toLocaleString() : "Not specified"},
        {key: "End", value: task?.end_time ? new Date(task.end_time).toLocaleString() : "Not specified"}
    ];

    const menuOptionNavigation = {
        "Edit task": "UpdateTask",
        "Assign task": "AssignTask",
        "Edit assignment": "UpdateAssignment",
    };

    const userMenuOptions = [
        { id: "1", title: "Edit assignment", icon: "pencil" },
        { id: "2", title: "Drop assignment", icon: "delete" },
    ];

    const taskMenuOptions = [
        {id: "1", title: "Edit task", icon: "pencil"},
        {id: "2", title: "Assign task", icon: "account"},
        {id: "3", title: "Delete task", icon: "delete"},
    ]

    const openUserMenu = (user_id: string) => {
        setUserVisibleMenus((prev) => ({ ...prev, [user_id]: true}));
    };
    const closeUserMenu = (user_id: string) => {
        setUserVisibleMenus((prev) => ({ ...prev, [user_id]: false}));
    };
    
    const openTaskMenu = () => setTaskMenuVisible(true);
    const closeTaskMenu = () => setTaskMenuVisible(false);

    const renderMenuOption = (item: { id: string; title: string; icon: string }, user_data: { user_id: string; first_name: string; last_name: string; assignment_id: number } | null) => (
        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOptionPress(item?.title, user_data)}>
            <IconButton icon={item.icon} size={20} style={styles.icon} iconColor="black" />
            <Text style={styles.menuText}>{item.title}</Text>
        </TouchableOpacity>
    );

    const renderItem = (item: { user_id: string; first_name: string; last_name: string; assignment_id: number }) => (
        <View style={styles.listItem}>
            <Text style={styles.userName}>{item?.first_name} {item?.last_name}</Text>
            <Menu
            visible={userVisibleMenus[item?.user_id]}
            onDismiss={() => closeUserMenu(item?.user_id)}
            anchor={
                <IconButton
                icon="dots-horizontal-circle"
                size={24}
                onPress={() => openUserMenu(item?.user_id)}
                iconColor="#666"
                />
            }
            style={styles.menuContainer}
            >
                <FlatList
                data={userMenuOptions}
                keyExtractor={(menuItem) => menuItem.id}
                renderItem={({ item: menuOption }) => renderMenuOption(menuOption, item)}
                />
            </Menu>
        </View>
    );

    const handleMenuOptionPress = (title: string, user_data: { user_id: string; first_name: string; last_name: string; assignment_id: number } | null) => {
        closeTaskMenu();
        if (user_data) closeUserMenu(user_data.user_id);
        if (title === "Delete task") {
            openModal("task");
        }
        else if (title === "Drop assignment") {
            setAssignmentDeleted(user_data?.assignment_id.toString() || "0");
            openModal("assignment");
        }
        else {
            navigation.navigate(menuOptionNavigation[title], { task_id, user_data });
        }
    }

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
                const data = await delete_task(access_token, task_id);

                if (data.message === "Task successfully deleted") {
                    Alert.alert("Success", "Task successfully deleted");
                    await getAllTasks();
                    navigation.navigate("Sidebar");
                    return;
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

    const cancelDeleteTask = () => {
        closeModal("task")
    };

    const confirmDeleteAssignment = async () => {
        closeModal("assignment");
        try {
            const access_token = await getToken();
            if (access_token) {
                const data = await delete_assignment(access_token, assignment_deleted);

                if (data.message === "Assignment successfully deleted") {
                    Alert.alert("Success", "Assignment successfully deleted");
                    await getAllTasks();
                    return;
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

    const cancelDeleteAssignment = () => {
        closeModal("assignment")
    };
    
    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.container}>
                <View style={styles.topRow}>
                    <Button title="← Back" color="#f0b44a" onPress={() => navigation.goBack()} />
                    <Menu
                    visible={taskMenuVisible}
                    onDismiss={closeTaskMenu}
                    anchor={
                        <IconButton
                        icon="dots-horizontal-circle"
                        size={24}
                        onPress={openTaskMenu}
                        iconColor="#f0b44a"
                        />
                    }
                    style={styles.menuContainer}
                    >
                        <FlatList
                        data={taskMenuOptions}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => renderMenuOption(item, null)}
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
                    visible={isModalVisible["task"]}
                    message="Are you sure you want to delete this task?"
                    onConfirm={confirmDeleteTask}
                    onCancel={cancelDeleteTask}
                />
                <ConfirmModal
                    visible={isModalVisible["assignment"]}
                    message="Are you sure you want to delete this assignment?"
                    onConfirm={confirmDeleteAssignment}
                    onCancel={cancelDeleteAssignment}
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
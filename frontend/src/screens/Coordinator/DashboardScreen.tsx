import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, ScrollView, StatusBar } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { removeToken } from "../../utils/auth_storage";
import { RootStackParamList } from "@/src/navigation/RootStackParamList";
import ConfirmStatus from "@/src/components/ConfirmStatus";
import { CoordinatorStackParamList } from "@/src/navigation/CoordinatorStackParamList";
import { useUserData } from "@/src/hooks/useUserDataContext";
import { useTasks } from "@/src/hooks/useTasksContext";

const DashboardScreen: React.FC = () => {
    const { tasks, getAllTasks, loading } = useTasks();
    const { userData } = useUserData();
    const navigation = useNavigation<NavigationProp<CoordinatorStackParamList>>();
    const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        const fetchTasks = async () => {
            await getAllTasks();
        };

        fetchTasks();
    }, []);
    console.log("Coordinator")

    const quickActions = [
        {label: "Create task", icon: "add-circle"},
        {label: "Assign task", icon: "assignment-ind"},
        {label: "Delete task", icon: "delete"},
    ];

    if (loading) {
        return <ActivityIndicator size="large" color="#f0a827"/>;
    }

    const handleLogout = async () => {
        try {
            await removeToken();
            parentNavigation.navigate("SignIn");
        }
        catch (error) {
            Alert.alert("Error");
        }
    };

    const handleTaskPress = (task_id: number) => {
        navigation.navigate("TaskDetails", { task_id })
    };

    const handleQuickActionPress = (label: string) => {
        if (label === "Create task") {
            navigation.navigate("CreateTask");
        }
        else {
            navigation.navigate("SearchTask", { title: label })
        }
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <StatusBar hidden={false} />
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Welcome, {userData?.user?.first_name || "User"}!</Text>
                <ConfirmStatus />
                <View style={styles.subContainer}>
                    <Text style={styles.subTitle}>Upcoming Tasks</Text>
                    {tasks?.sorted_tasks?.map((task_id: any) => (
                        <TouchableOpacity key={task_id} style={styles.task} onPress={() => handleTaskPress(task_id)}>
                            <Text>{tasks?.tasks[task_id.toString()]?.task_name}</Text>
                            <Text>From: {tasks?.tasks[task_id.toString()]?.start_time}</Text>
                            <Text>To: {tasks?.tasks[task_id.toString()]?.end_time}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity>
                        <Text style={styles.link}>View Full Calendar</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={handleLogout}>
                    <Text style={styles.link}>Log out</Text>
                </TouchableOpacity>
                <View style={styles.actionsContainer}>
                    <Text style={styles.subTitle}>Quick Actions</Text>
                    {quickActions.map((item, index) => (
                            <TouchableOpacity key={index} style={styles.action} onPress={() => {handleQuickActionPress(item.label)}}>
                                <Text style={styles.actionText}>{item?.label}</Text>
                                <MaterialIcons name={item.icon} size={25} color="black" />
                            </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "#ffffff",
        paddingTop: 16
    },
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        padding: 16,
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#f0b44a",
        textAlign: "center",
    },
    pendingContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
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
    textBox: {

    },
    text: {
        fontSize: 25,
        fontWeight: "600",
    },
    subTitle: {
        fontSize: 25,
        fontWeight: "600"
    },
    subContainer: {

    },
    task: {
        marginBottom: 8,
        padding: 8,
        backgroundColor: "#f9f9f9",
        borderRadius: 4,
    },
    link: {
        fontSize: 14,
        color: "blue",
        textDecorationLine: "underline",
    },
    actionsContainer: {
        marginTop: 15
    },
    action: {
        marginBottom: 8,
        padding: 8,
        backgroundColor: "#f9f9f9",
        borderRadius: 15,
        height: 50,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "50%"
    },
    actionText: {
        fontSize: 16,
        fontWeight: "400"
    }
});

export default DashboardScreen;
import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, ScrollView, StatusBar } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { removeToken } from "../../utils/auth_storage";
import { RootStackParamList } from "@/src/navigation/RootStackParamList";
import ConfirmStatus from "@/src/components/ConfirmStatus";
import { useUserData } from "@/src/hooks/useUserDataContext";
import { useUserTasks } from "@/src/hooks/useUserTasksContext";
import { UserStackParamList } from "@/src/navigation/UserStackParamList";
import { useTasks } from "@/src/hooks/useTasksContext";

const DashboardScreen: React.FC = () => {
    const { userTasks, getUserTasks, loading } = useUserTasks();
    const { userData } = useUserData();
    const { getAllTasks } = useTasks();
    const navigation = useNavigation<NavigationProp<UserStackParamList>>();
    const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        const fetchTasks = async () => {
            await getUserTasks();
            await getAllTasks();
        };

        fetchTasks();
    }, []);
    console.log("user")

    const quickActions = [
        {label: "Sign up for a task", icon: "assignment-add"},
        {label: "Drop a task", icon: "delete"},
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

    const handleTaskPress = (task_id: number, assignment_id: number) => {
        navigation.navigate("TaskDetails", { task_id: task_id.toString(), assignment_id: assignment_id.toString() })
    };

    const handleQuickActionPress = (label: string) => {
        navigation.navigate("SearchTask", { title: label })
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <StatusBar hidden={false} />
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Welcome, {userData?.user?.first_name || "User"}!</Text>
                <ConfirmStatus />
                <View style={styles.subContainer}>
                    <Text style={styles.subTitle}>Upcoming Tasks</Text>
                    {userTasks?.user_tasks?.map((task: any) => (
                        <TouchableOpacity key={task?.task_id} style={styles.task} onPress={() => handleTaskPress(task?.task_id, task?.assignment_id)}>
                            <Text>{task?.task_name}</Text>
                            <Text>From: {task?.start_time}</Text>
                            <Text>To: {task?.end_time}</Text>
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
        marginTop: 15,
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
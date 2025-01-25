import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, ScrollView } from "react-native";
import { useNavigation, NavigationProp, CommonActions } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { format } from 'date-fns';

import { removeToken } from "../../utils/auth_storage";
import { RootStackParamList } from "@/src/navigation/RootStackParamList";
import ConfirmStatus from "@/src/components/ConfirmStatus";
import { useUserData } from "@/src/hooks/useUserDataContext";
import { useUserTasks } from "@/src/hooks/useUserTasksContext";
import { UserStackParamList } from "@/src/navigation/UserStackParamList";
import { useTasks } from "@/src/hooks/useTasksContext";
import { monthDisplay } from "@/src/utils/format";
import { gold } from "@/src/utils/colors";

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

    const quickActions = [
        {label: "Sign up for a task", icon: "assignment-add"},
        {label: "Drop a task", icon: "delete"},
    ];

    if (loading) {
        return <ActivityIndicator size="large" color={`${gold}`}/>;
    }

    const handleTaskPress = (task_id: number, assignment_id: number) => {
        navigation.navigate("TaskDetails", { task_id: task_id.toString(), assignment_id: assignment_id.toString() })
    };

    const handleQuickActionPress = (label: string) => {
        navigation.navigate("SearchTask", { title: label })
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Welcome, {userData?.user?.first_name || "User"}!</Text>
                <ConfirmStatus />
                <View style={styles.subContainer}>
                    <Text style={styles.subTitle}>Upcoming Tasks</Text>
                    {userTasks?.user_tasks?.map((task: any, index: number) => (() => {
                        if (index >= 5) return null;
                        
                        const day = format(new Date(task?.start_time), "d");
                        const month = format(new Date(task?.start_time), "MM");
                        const start_time = format(new Date(task?.start_time), "HH:mm");
                        const end_time = format(new Date(task?.end_time), "HH:mm");

                        return (
                            <TouchableOpacity key={task?.task_id} style={styles.task} onPress={() => handleTaskPress(task?.task_id, task?.assignment_id)}>
                                <View style={styles.dateContainer}>
                                    <Text style={styles.dateText}>{day}</Text>
                                    <Text style={styles.monthText}>{monthDisplay[month].toUpperCase()}</Text>
                                </View>
                                <View style={styles.taskDetailsContainer}>
                                    <View style={styles.row}>
                                        <Text style={styles.firstRowText}>{task?.task_name}</Text>
                                        <Text>{start_time}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={{ color: "grey" }}>{task?.description}</Text>
                                        <Text style={{ color: "grey" }}>{end_time}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })())}
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>View Full Calendar</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.actionsContainer}>
                    <Text style={styles.subTitle}>Quick Actions</Text>
                    {quickActions.map((item, index) => (
                            <TouchableOpacity key={index} style={styles.action} onPress={() => {handleQuickActionPress(item.label)}}>
                                <Text style={styles.actionText}>{item?.label}</Text>
                                <MaterialIcons name={item.icon} size={25} color={`${gold}`} />
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
        color: `${gold}`,
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
        flexDirection: "row",
        justifyContent: "space-between"
    },
    dateContainer: {
        flex: 1,
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "space-around"
    },
    dateText: {
        fontSize: 28,
        fontWeight: "600",
        color: `${gold}`,
    },
    monthText: {
        fontSize: 20,
        fontWeight: "bold",
        color: `${gold}`,
    },
    taskDetailsContainer: {
        marginTop: 3,
        flex: 4,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    firstRowText: {
        fontSize: 16,
        fontWeight: "bold"
    },
    button: {
        width: "40%",
        height: 36,
        backgroundColor: `${gold}`,
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: "center",
        opacity: 0.5,
    },
    buttonText: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#FFFFFF",
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
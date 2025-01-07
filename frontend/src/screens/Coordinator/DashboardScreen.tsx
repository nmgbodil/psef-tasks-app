import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, ScrollView } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { getToken, removeToken } from "../../utils/auth_storage";
import { fetch_user_data, get_my_pending_tasks } from "../../services/task_api_services";
import { useTasks } from "@/src/hooks/useTasksContext";
import { IconButton } from "react-native-paper";
import { RootStackParamList } from "@/src/navigation/RootStackParamList";
import ConfirmStatus from "@/src/components/ConfirmStatus";
import { CoordinatorStackParamList } from "@/src/navigation/CoordinatorStackParamList";

const DashboardScreen: React.FC = () => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { tasks, getAllTasks } = useTasks();
    const navigation = useNavigation<NavigationProp<CoordinatorStackParamList>>();
    const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        const fetchTasks = async () => {
            await getAllTasks();
        };

        fetchTasks();
    }, []);

    const quickActions = [
        {label: "Create task", icon: "plus-circle"},
        {label: "Assign task", icon: "account"},
        {label: "Delete task", icon: "delete"},
    ];

    const fetchUserData = async () => {
        try {
            const access_token = await getToken();
            if (access_token) {
                const data = await fetch_user_data(access_token);

                if (data.message === "User data successfully retrieved") {
                    return data;
                }
            }
            else {
                parentNavigation.navigate("SignIn");
                return null;
            }
        }
        catch (error: any) {
            handleError(error);
        }
    };

    const handleError = (error: any) => {
        if (error.error) {
            switch (error.error) {
                case "This user does not exist":
                    Alert.alert("Error", "This account does not exist");
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

    useEffect(() => {
        const fetchAndSetData = async () => {
            try {
                const data = await fetchUserData();
                if (data) {
                    setUserData(data);
                }
            }
            catch (error) {
                console.error("Error fetching data:", error);
            }
            finally {
                setLoading(false);
            }
        };

        fetchAndSetData();
    }, []);

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
            parentNavigation.navigate("SearchTask", { title: label })
        }
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
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
                                <IconButton icon={item.icon} size={25} iconColor="black" />
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
        backgroundColor: "#ffffff"
    },
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
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
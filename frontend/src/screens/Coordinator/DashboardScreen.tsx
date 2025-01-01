import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/types";
import { getToken, removeToken } from "../../utils/auth_storage";
import { fetch_user_data } from "../../services/auth_api_services";
import { useTasks } from "@/src/hooks/useTasksContext";

const DashboardScreen: React.FC = () => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { tasks, getAllTasks } = useTasks();
    const navigation = useNavigation();
    const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        const fetchTasks = async () => {
            await getAllTasks();
        };

        fetchTasks();
    }, [getAllTasks])

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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {userData?.user?.first_name || "User"}!</Text>
            <Text style={styles.text}>Total Tasks:</Text>
            <View style={styles.task_container}>
                <Text style={styles.subtitle}>Upcoming Tasks</Text>
                {tasks?.sorted_tasks?.map((task_id: any) => (
                    <TouchableOpacity key={task_id} style={styles.task} onPress={() => handleTaskPress(task_id)}>
                        <Text>{tasks?.assignments[task_id.toString()]?.task_name}</Text>
                        <Text>From: {tasks?.assignments[task_id.toString()]?.start_time}</Text>
                        <Text>To: {tasks?.assignments[task_id.toString()]?.end_time}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity>
                    <Text style={styles.link}>View Full Calendar</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.link}>Log out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
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
    text: {
        fontSize: 25,
        fontWeight: "600",
    },
    subtitle: {
        fontSize: 25,
        fontWeight: "600"
    },
    task_container: {

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
    }
});

export default DashboardScreen;
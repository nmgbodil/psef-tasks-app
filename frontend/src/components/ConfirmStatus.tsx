import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { format } from 'date-fns';

import { TaskStatus } from "../utils/types";
import { getToken } from "../utils/auth_storage";
import { get_my_pending_tasks, update_status } from "../services/task_api_services";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/RootStackParamList";
import { monthDisplay } from "../utils/format";

const ConfirmStatus = () => {
    const [pending_tasks, setPendingTasks] = useState<any>([]);
    const navigation = useNavigation();
    const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        const fetchTasks = async () => {
            const data = await fetchMyPendingTasks();
            setPendingTasks(data);
        };

        fetchTasks();
    }, []);
    console.log(pending_tasks);

    const fetchMyPendingTasks = async () => {
            try {
                const access_token = await getToken();
                if (access_token) {
                    const data = await get_my_pending_tasks(access_token);
    
                    if (data.message === "Pending user tasks successfully retrieved") {
                        return data;
                    }
                }
                else {
                    parentNavigation.navigate("SignIn");
                    return null;
                }
            }
            catch (error: any) {
                if (error.error) {
                    Alert.alert("Error", error.error);
                }
            }
        };

    const markDone = (assignment_id: string) => {
        updateStatus(TaskStatus.Completed, assignment_id);
    };
    
    const markUndone = (assignment_id: string) => {
        updateStatus(TaskStatus.Incompleted, assignment_id);
    };
    
    const updateStatus = async (status: string, assignment_id: string) => {
        try {
            const access_token = await getToken();
            if (access_token) {
                const data = await update_status(access_token, assignment_id, status)
    
                if (data.message === "Task status successfully updated") {
                    const new_pending_task_list = await fetchMyPendingTasks();
                    setPendingTasks(new_pending_task_list);
                }
            }
            else {
                parentNavigation.navigate("SignIn");
                return null;
            }
        }
        catch (error: any) {
            if (error.error) {
                Alert.alert("Error", error.error);
            }
        }
    };

    return (
        <View>
            {pending_tasks?.pending_tasks?.length > 0 && (() => {
                    const task_to_confirm = pending_tasks?.pending_tasks[0];
                    const day = format(new Date(task_to_confirm?.start_time), "d");       // 6 (day of the month)
                    const month = format(new Date(task_to_confirm?.start_time), "MM");   // 01 (month)
                    const start_time = format(new Date(task_to_confirm?.start_time), "HH:mm"); // 12:34 (hours and minutes)
                    const end_time = format(new Date(task_to_confirm?.end_time), "HH:mm");

                    return (
                        <View style={styles.container}>
                            <Text style={styles.subTitle}>Did you do this recent task?</Text>
                            <View style={styles.pendingContainer}>
                                <View style={styles.textBox}>
                                    <Text>{task_to_confirm?.task_name}</Text>
                                    <Text>{task_to_confirm?.description}</Text>
                                    <Text>{day} {monthDisplay[month]} @ {start_time} - {end_time}</Text>
                                </View>
                                <TouchableOpacity onPress={() => markUndone(task_to_confirm?.assignment_id)}>
                                    <SimpleLineIcons name="close" size={45} color="#093451" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => markDone(task_to_confirm?.assignment_id)}>
                                <SimpleLineIcons name="check" size={45} color="#093451" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 15,
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
    },
    subTitle: {
        fontSize: 25,
        fontWeight: "600"
    },
    textBox: {

    },
});

export default ConfirmStatus;
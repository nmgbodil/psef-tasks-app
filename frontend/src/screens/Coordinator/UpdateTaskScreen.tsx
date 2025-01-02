import React, { useState } from "react";
import { View, Text, Button, StyleSheet, FlatList, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform, StatusBar, SafeAreaView } from "react-native";
import { RootStackParamList, TaskData, UpdateTaskProps } from "@/src/navigation/types";
import { getToken } from "@/src/utils/auth_storage";
import { update_task } from "@/src/services/task_coordinator_api_services";
import { NavigationProp } from "@react-navigation/native";
import { useTasks } from "@/src/hooks/useTasksContext";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const UpdateTaskScreen = ({ route, navigation }: UpdateTaskProps) => {
    const { task_id, user_data } = route.params;
    const { tasks, getAllTasks } = useTasks();
    const task = tasks?.assignments[task_id.toString()];
    const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();

    const taskData = [
        {key: "Description", value: task?.description || "No description"},
        {key: "Start", value: task?.start_time ? new Date(task.start_time).toLocaleString() : "Not specified"},
        {key: "End", value: task?.end_time ? new Date(task.end_time).toLocaleString() : "Not specified"}
    ];

    const [name, setName] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [start_time, setStartTime] = useState<string>("");
    const [end_time, setEndTime] = useState<string>("");
    const [max_participants, setMaxParticipants] = useState<number>(0);
    const [open, setOpen] = useState<{ [key: string]: boolean }>({});
    const [adj, setAdj] = useState<string>("start");

    const handleNumberChange = (text: string) => {
        const numeric_val = parseInt(text, 10);
        if (!isNaN(numeric_val)) {
            setMaxParticipants(numeric_val);
        }
    };

    const showDatePicker = () => {
        setOpen((prev) => ({ ...prev, [adj]: true}));
    };
    const hideDatePicker = () => {
        setOpen((prev) => ({ ...prev, [adj]: false}));
    };

    const handleChooseDate = (date: Date) => {
        if (adj === "start") {
            if ((!end_time || date < new Date(end_time)) && date >= new Date()) {
                setStartTime(date.toISOString());
                console.log(start_time);
            }
            else if (date >= new Date(end_time)){
                Alert.alert("", "Start date must be before end date");
            }
            else if (date < new Date()) {
                Alert.alert("", "The date/time must be earlier than right now");
            }
        }
        else {
            if ((!start_time || date > new Date(start_time)) && date >= new Date()) {
                setEndTime(date.toISOString());
                // console.log(end_time);
            }
            else if (date <= new Date(start_time)) {
                Alert.alert("", "End date must be after start date");
            }
            else if (date < new Date()) {
                Alert.alert("", "The date/time must be earlier than right now");
            }
        }
        hideDatePicker();
    }

    const handleError = (error: any) => {
        if (error.error) {
            switch (error.error) {
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
            if (name && type && description && start_time && end_time && max_participants && access_token) {
                const task_updates: TaskData = {
                    task_id: null,
                    task_name: name,
                    task_type: type,
                    description: description,
                    start_time: start_time,
                    end_time: end_time,
                    max_participants: max_participants,
                    status: null
                };
                const data = await update_task(access_token, task_updates, task_id);

                if (data.message === "Task successfully updated") {
                    Alert.alert("Success", "Task was successfully updated");
                    await getAllTasks();
                    navigation.goBack();
                }
                else if (access_token) {
                    Alert.alert("", "Please enter at least one field");
                }
                else {
                    parentNavigation.navigate("SignIn");
                }
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
                    <Button title="← Back" color="#f0b44a" onPress={() => navigation.goBack()} />
                    <Button title="Done" color="#f0b44a" onPress={handleSubmit} />
                </View>
                <Text style={styles.title}>{task?.task_name}</Text>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <KeyboardAwareScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                    >
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
                        </View>
                        <View style={styles.DataEntry}>
                            <Text style={styles.text}>Task Name</Text>
                            <TextInput
                                placeholder="Enter a new task name"
                                placeholderTextColor="#A0A0A0"
                                value={name}
                                onChangeText={setName}
                                style={styles.inputText}
                                autoCapitalize="words"
                            />
                            <Text style={styles.text}>Task Type</Text>
                            <TextInput
                                placeholder="Enter a new task type"
                                placeholderTextColor="#A0A0A0"
                                value={type}
                                onChangeText={setType}
                                style={styles.inputText}
                                autoCapitalize="words"
                            />
                            <Text style={styles.text}>Description</Text>
                            <TextInput
                                placeholder="Enter a new task description"
                                placeholderTextColor="#A0A0A0"
                                value={description}
                                onChangeText={setDescription}
                                style={styles.inputText}
                                autoCapitalize="sentences"
                            />
                            <Text style={styles.text}>Start Date & Time</Text>
                            <Text style={styles.dateText}>{start_time || "No date selected"}</Text>
                            <Button title="Pick Date & Time" onPress={() => {setAdj("start"); showDatePicker();}} />
                            <DateTimePickerModal
                                isVisible={open[adj]}
                                mode="datetime"
                                onConfirm={handleChooseDate}
                                onCancel={hideDatePicker}
                            />
                            <Text style={styles.text}>End Date & Time</Text>
                            <Text style={styles.dateText}>{end_time || "No date selected"}</Text>
                            <Button title="Pick Date & Time" onPress={() => {setAdj("end"); showDatePicker();}} />
                            <DateTimePickerModal
                                isVisible={open[adj]}
                                mode="datetime"
                                onConfirm={handleChooseDate}
                                onCancel={hideDatePicker}
                            />
                            <Text style={styles.text}>Maximum number of participants</Text>
                            <TextInput
                                placeholder="0"
                                placeholderTextColor="#A0A0A0"
                                value={max_participants.toString()}
                                onChangeText={handleNumberChange}
                                style={styles.numberInput}
                                keyboardType="numeric"
                            />
                        </View>
                    </KeyboardAwareScrollView>
                </KeyboardAvoidingView>
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
        // padding: 16,
        paddingTop: 16,
        paddingHorizontal: 16
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
    numberInput: {
        width: "15%",
        height: 50,
        borderWidth: 1,
        borderColor: "#D1D1D1",
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        marginBottom: 16,
        color: "#000000",
    },
    inputText: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#D1D1D1",
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        marginBottom: 16,
        color: "#000000",
    }
});

export default UpdateTaskScreen;
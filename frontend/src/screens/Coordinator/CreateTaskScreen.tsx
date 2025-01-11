import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Icon from "react-native-vector-icons/MaterialIcons";
import { format } from "date-fns";

import {  TaskData } from "@/src/utils/types";
import { getToken } from "@/src/utils/auth_storage";
import { create_task } from "@/src/services/task_coordinator_api_services";
import { RootStackParamList } from "@/src/navigation/RootStackParamList";
import { CoordinatorStackParamList } from "@/src/navigation/CoordinatorStackParamList";
import { monthDisplay } from "@/src/utils/format";
import { gold } from "@/src/utils/colors";

const CreateTaskScreen = () => {
    const navigation = useNavigation<NavigationProp<CoordinatorStackParamList>>();
    const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();

    const [name, setName] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [start_time, setStartTime] = useState<string>("");
    const [end_time, setEndTime] = useState<string>("");
    const [isChecked, setIsChecked] = useState(false);
    const [max_participants, setMaxParticipants] = useState<number | null>(null);
    const [open, setOpen] = useState<{ [key: string]: boolean }>({});
    const [adj, setAdj] = useState<string>("start");

    const openCloseNumberBox = (rtv: boolean) => {
        setIsChecked(rtv);
        if (!rtv) {
            setMaxParticipants(null);
        } 
    };

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
                case "Task has already been created":
                    Alert.alert("", "This task already exists");
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

    const handleSubmit = async () => {
        try {
            const access_token = await getToken();
            if (name && type && description && start_time && end_time && access_token && max_participants != 0) {
                const task: TaskData = {
                    task_id: null,
                    task_name: name,
                    task_type: type,
                    description: description,
                    start_time: start_time,
                    end_time: end_time,
                    max_participants: max_participants,
                    status: null
                };
                const data = await create_task(access_token, task);
                if (data.message === "Task successfully created") {
                    Alert.alert("Success", "Task was successfully created");
                    navigation.goBack();
                }
            }
            else if (max_participants == 0) {
                Alert.alert("", "Maximum number of participants cannot be 0");
            }
            else if (access_token) {
                Alert.alert("", "Please fill al required fields");
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
                <Text style={styles.title}>Create a new task</Text>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <KeyboardAwareScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.DataEntry}>
                            <Text style={styles.text}>Task Name*</Text>
                            <TextInput
                                placeholder="Enter a new task name"
                                placeholderTextColor="#A0A0A0"
                                value={name}
                                onChangeText={setName}
                                style={styles.inputText}
                                autoCapitalize="words"
                            />
                            <Text style={styles.text}>Task Type*</Text>
                            <TextInput
                                placeholder="Enter a new task type"
                                placeholderTextColor="#A0A0A0"
                                value={type}
                                onChangeText={setType}
                                style={styles.inputText}
                                autoCapitalize="words"
                            />
                            <Text style={styles.text}>Description*</Text>
                            <TextInput
                                placeholder="Enter a new task description"
                                placeholderTextColor="#A0A0A0"
                                value={description}
                                onChangeText={setDescription}
                                style={styles.inputText}
                                autoCapitalize="sentences"
                            />
                            <Text style={styles.text}>Start Date & Time*</Text>
                            {(() => {
                                const day = start_time !== "" ? format(new Date(start_time), "d") : "";
                                const month = start_time !== "" ? format(new Date(start_time), "MM") : "";
                                const year = start_time !== "" ? format(new Date(start_time), "yyyy") : "";
                                const selected_start_time = start_time !== "" ? format(new Date(start_time), "HH:mm") : "";
                                const formatted_string = `${day} ${monthDisplay[month]}, ${year} @ ${selected_start_time}`;

                                return (
                                    <View>
                                        <View style={styles.inputTime}>
                                            <Text style={{ fontSize: 16 }}>{start_time !== "" ? formatted_string : "No date selected"}</Text>
                                        </View>
                                    <Button title="Pick Date & Time" color={`${gold}`} onPress={() => {setAdj("start"); showDatePicker();}} />
                                    <DateTimePickerModal
                                        isVisible={open[adj]}
                                        mode="datetime"
                                        onConfirm={handleChooseDate}
                                        onCancel={hideDatePicker}
                                    />
                                    </View>
                                );
                            })()}
                            <Text style={styles.text}>End Date & Time</Text>
                            {(() => {
                                const day = end_time !== "" ? format(new Date(end_time), "d") : "";
                                const month = end_time !== "" ? format(new Date(end_time), "MM") : "";
                                const year = end_time !== "" ? format(new Date(end_time), "yyyy") : "";
                                const selected_end_time = end_time !== "" ? format(new Date(end_time), "HH:mm") : "";
                                const formatted_string = `${day} ${monthDisplay[month]}, ${year} @ ${selected_end_time}`;

                                return (
                                    <View>
                                        <View style={styles.inputTime}>
                                            <Text style={{ fontSize: 16 }}>{end_time !== "" ? formatted_string : "No date selected"}</Text>
                                        </View>
                                        <Button title="Pick Date & Time" color={`${gold}`} onPress={() => {setAdj("end"); showDatePicker();}} />
                                        <DateTimePickerModal
                                            isVisible={open[adj]}
                                            mode="datetime"
                                            onConfirm={handleChooseDate}
                                            onCancel={hideDatePicker}
                                        />
                                    </View>
                                );
                            })()}
                            <View style={styles.checkbox}>
                                <Text style={styles.text}>Maximum number of participants</Text>
                                <TouchableOpacity onPress={() => openCloseNumberBox(!isChecked)}>
                                    <Icon name={isChecked ? "check-box" : "check-box-outline-blank"} size={30} color={`${gold}`}/>
                                </TouchableOpacity>
                            </View>
                            {isChecked && (
                                <TextInput
                                    placeholder="0"
                                    placeholderTextColor="#A0A0A0"
                                    value={max_participants ? max_participants.toString() : "0"}
                                    onChangeText={handleNumberChange}
                                    style={styles.numberInput}
                                    keyboardType="numeric"
                                />
                            )}
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
    DataEntry: {
        marginTop: 20
    },
    text: {
        fontSize: 16,
        color: "#000",
        fontWeight: "bold",
    },
    checkbox: {
        flexDirection: "row",
        justifyContent: "space-between",
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
    },
    inputTime: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#D1D1D1",
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
        color: "#000000",
        justifyContent: "center"
    }
});

export default CreateTaskScreen;
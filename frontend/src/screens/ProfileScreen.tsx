import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useNavigation, NavigationProp, CommonActions } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { RootStackParamList } from "../navigation/RootStackParamList";
import { CoordinatorStackParamList } from "../navigation/CoordinatorStackParamList";
import { useUserData } from "../hooks/useUserDataContext";
import { gold } from "../utils/colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TextInput } from "react-native-paper";
import SwipeButton from "../components/SwipeButton";
import { getToken, removeToken } from "../utils/auth_storage";
import { delete_user, update_first_name, update_last_name } from "../services/user_api_services";
import ConfirmModal from "../components/ConfirmModal";
import { forgot_password } from "../services/auth_api_services";

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<CoordinatorStackParamList>>();
    const parentNavigation = navigation.getParent<NavigationProp<RootStackParamList>>();
    const { userData, getUserData } = useUserData();

    const [isModalVisibla, setIsModalVisible] = useState<boolean>(false);
    const [isEditFirstName, setEditFirstName] = useState<boolean>(false);
    const [isEditLastName, setEditLastName] = useState<boolean>(false);

    const openFirstKeyboard = () => {
        setEditLastName(false);
        setEditFirstName(true);
    };

    const closeFirstNameKeyboard = () => {
        setFirstName(userData.user.first_name);
        setEditFirstName(false);
    };

    const openLastKeyboard = () => {
        setEditFirstName(false);
        setEditLastName(true);
    };

    const closeLastNameKeyboard = () => {
        setLastName(userData.user.last_name);
        setEditLastName(false);
    };

    // Keyboard listener for dismissal
    useEffect(() => {
        const keyboardListener = Keyboard.addListener('keyboardDidHide', () => {
            closeFirstNameKeyboard();
            closeLastNameKeyboard();
        });
        
        // Clean up
        return () => {
            keyboardListener.remove();
        }
    }, []);

    const onTaskReminder = () => {};

    const onPostTaskConfirmation = () => {};

    // Personal info
    const [first_name, setFirstName] = useState<string>(userData.user.first_name);
    const [last_name, setLastName] = useState<string>(userData.user.last_name);

    // Notification preferences
    const [alert_time, setAlertTime] = useState(); // replace with users choice
    const [post_task_alert, setPostTaskAlert] = useState<boolean>(true); // replace with user's choice
    const [alert_mode, setAlertMode] = useState<string>(""); // replace with users choice

    const iconSize = 22;

    const editFirstName = async () => {
        try {
            const access_token = await getToken();
            if (access_token && first_name?.length > 0) {
                const data = await update_first_name(access_token, first_name);

                if (data.message === "First name updated successfully") {
                    await getUserData();
                }
            }
            else if (access_token) {
                Alert.alert("", "First name must contain at least 1 character");
            }
            else {
                parentNavigation.navigate("SignIn");
            }
        }
        catch (error: any) {
            if (error.error) {
                Alert.alert("Error", error?.error);
            }
        }
    };

    const editLastName = async () => {
        try {
            const access_token = await getToken();
            if (access_token && last_name?.length > 0) {
                const data = await update_last_name(access_token, last_name);

                if (data.message === "Last name updated successfully") {
                    await getUserData();
                }
            }
            else if (access_token) {
                Alert.alert("", "Last name must contain at least 1 character");
            }
            else {
                parentNavigation.navigate("SignIn");
            }
        }
        catch (error: any) {
            if (error.error) {
                Alert.alert("Error", error?.error);
            }
        }
    };

    const editPassword = async () => {
        try {
            const data = await forgot_password(userData?.user?.email);

            if (data.message === "Password reset email sent") {
                Alert.alert("", "Password reset email sent")
                return;
            }
        }
        catch (error: any) {
            if (error.error) {
                Alert.alert("Error", error?.error);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await removeToken();
            parentNavigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "SignIn" }],
                })
            );
        }
        catch (error) {
            Alert.alert("Error");
        }
    };

    const openModal = () => setIsModalVisible(true);
    const closeModal = () => setIsModalVisible(false);

    const confirmDeleteUser = async () => {
        closeModal();
        try {
            const access_token = await getToken();
            if (access_token) {
                const data = await delete_user(access_token);

                if (data.message === "User deleted successfully") {
                    Alert.alert("", "Your account has been deleted");
                    parentNavigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: "SignIn" }],
                        })
                    );
                }
            }
            else {
                parentNavigation.navigate("SignIn");
            }
        }
        catch (error: any) {
            if (error.error) {
                Alert.alert("Error", error?.error);
            }
        }
    };

    const cancelDeleteUser = () => {
        closeModal();
    };

    return (
        // <TouchableWithoutFeedback onPress={() => {closeFirstNameKeyboard(); closeLastNameKeyboard();}} accessible={false}>
            <SafeAreaView style={styles.safeContainer}>
                <View style={styles.container}>
                    {/* <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                    > */}
                        <KeyboardAwareScrollView
                            contentContainerStyle={{ flexGrow: 1 }}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.dataContainer}>
                                <View style={styles.dataBox}>
                                    <View style={styles.textBox}>
                                        <Text style={styles.dataTitle}>First name</Text>
                                        {isEditFirstName ? (
                                            <TextInput
                                                style={styles.inputText}
                                                placeholder={first_name}
                                                value={first_name}
                                                onChangeText={setFirstName}
                                                onSubmitEditing={editFirstName} // replace with handleUpdateFirstName
                                                returnKeyType="go"
                                                textColor="#000000"
                                            />
                                        ) : (
                                            <Text style={styles.dataEntry}>{userData?.user?.first_name}</Text>
                                        )}
                                    </View>
                                    <TouchableOpacity style={styles.icon} onPress={openFirstKeyboard}>
                                        <MaterialIcons name="edit" size={iconSize} color={gold} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.separator1} />
                                <View style={styles.dataBox}>
                                    <View style={styles.textBox}>
                                        <Text style={styles.dataTitle}>Last name</Text>
                                        {isEditLastName ? (
                                            <TextInput
                                                style={styles.inputText}
                                                placeholder={last_name}
                                                value={last_name}
                                                onChangeText={setLastName}
                                                onSubmitEditing={editLastName} // replace with handleUpdateLastName
                                                returnKeyType="go"
                                                textColor="#000000"
                                            />
                                        ) : (
                                            <Text style={styles.dataEntry}>{userData?.user?.last_name}</Text>
                                        )}
                                    </View>
                                    <TouchableOpacity style={styles.icon} onPress={openLastKeyboard}>
                                        <MaterialIcons name="edit" size={iconSize} color={gold} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.separator1} />
                                <View style={styles.dataBox}>
                                    <View style={styles.textBox}>
                                        <Text style={styles.dataTitle}>Email</Text>
                                        <Text style={styles.dataEntry}>{userData?.user?.email}</Text>
                                    </View>
                                </View>
                                <View style={styles.separator1} />
                                <View style={styles.dataBox}>
                                    <View style={styles.textBox}>
                                        <Text style={styles.dataTitle}>Password</Text>
                                        <Text style={styles.dataEntry}>**********</Text>
                                    </View>
                                    <TouchableOpacity style={styles.icon} onPress={editPassword}>
                                        <MaterialIcons name="edit" size={iconSize} color={gold} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.separator1} />
                                <View style={styles.dataBox}>
                                    <View style={styles.textBox}>
                                        <Text style={styles.dataTitle}>Status</Text>
                                        <Text style={styles.dataEntry}>{userData?.user?.role}</Text>
                                    </View>
                                </View>
                                <View style={styles.separator1} />
                            </View>
                            <Text style={styles.subTitle}>Notification Preferences</Text>
                            <View style={styles.actionsContainer}>
                                <View style={styles.preferenceRow}>
                                    <Text style={styles.label}>Task reminder</Text>
                                    <View pointerEvents="box-none">
                                        <SwipeButton onSwitch={onTaskReminder} />
                                    </View>
                                </View>
                                <View style={styles.separator2} />
                                <View style={styles.preferenceRow}>
                                    <Text style={styles.label}>Alert task</Text>
                                </View>
                                <View style={styles.separator2} />
                                <View style={styles.preferenceRow}>
                                    <Text style={styles.label}>Post-task confirmation alert</Text>
                                    <View pointerEvents="box-none">
                                        <SwipeButton onSwitch={onPostTaskConfirmation} />
                                    </View>
                                </View>
                                <View style={styles.separator2} />
                                <View style={styles.preferenceRow}>
                                    <Text style={styles.label}>Alert mode</Text>
                                </View>
                            </View>
                            <Text style={styles.subTitle}>Account Actions</Text>
                            <View style={styles.actionsContainer}>
                                <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
                                    <Text style={styles.logout}>Logout</Text>
                                </TouchableOpacity>
                                <View style={styles.separator2} />
                                <TouchableOpacity style={styles.actionRow} onPress={openModal}>
                                    <Text style={styles.deleteAccount}>Delete account</Text>
                                </TouchableOpacity>
                            </View>
                            <ConfirmModal
                                visible={isModalVisibla}
                                message="Are you sure you want to delete your account?"
                                onConfirm={confirmDeleteUser}
                                onCancel={cancelDeleteUser}
                            />
                        </KeyboardAwareScrollView>
                    {/* </KeyboardAvoidingView> */}
                </View>
            </SafeAreaView>
        // </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        padding: 16,
    },
    dataContainer: {
        borderColor: "black",
    },
    dataBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#ffffff",
        height: 70,
    },
    textBox: {
        flex: 15,
        justifyContent: "space-between",
    },
    inputText: {
        width: "90%",
        height: 40,
        borderWidth: 1,
        borderColor: "#D1D1D1",
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        marginBottom: 16,
        color: "#000000",
        backgroundColor: "#ffffff"
    },
    icon: {
        flex: 1,
    },
    dataTitle: {
        fontSize: 12,
        color: "#8a8f95",
    },
    dataEntry: {
        fontSize: 16,
        color: "#000000",
    },
    separator1: {
        height: 1,
        backgroundColor: "#8a8f95",
        opacity: 0.3,
        marginHorizontal: 6,
    },
    subTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginTop: 20,
    },
    actionsContainer: {
        backgroundColor: "#f8f8f8",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        width: "100%",
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginTop: 10
    },
    preferenceRow: {
        flexDirection: "row",
        paddingVertical: 10,
        justifyContent: "space-between",
        alignItems: "center",
    },
    label: {
        fontSize: 16,
        color: "#333",
    },
    actionRow: {
        paddingVertical: 10,
    },
    logout: {
        fontSize: 16,
    },
    deleteAccount: {
        fontSize: 16,
        color: "red"
    },
    separator2: {
        height: 1,
        backgroundColor: "#e0e0e0",
    },
});

export default ProfileScreen;
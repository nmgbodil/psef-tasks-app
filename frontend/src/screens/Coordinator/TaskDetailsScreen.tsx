import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import {Menu, IconButton } from "react-native-paper";
import { CoordinatorStackParamList, TaskDetailsProps } from "@/src/navigation/types";

// function TaskDetailsScreen({ route, navigation }: any) {
const TaskDetailsScreen = ({ route, navigation }: TaskDetailsProps) => {
    const [userVisibleMenus, setUserVisibleMenus] = useState<{ [key: string]: boolean }>({});
    const [taskMenuVisible, setTaskMenuVisible] = useState(false);
    const { task_id, task } = route.params;

    const taskData = [
        {key: "Description", value: task?.description || "No description"},
        {key: "Start", value: new Date(task?.start_time).toLocaleString() || "Not specified"},
        {key: "End", value: new Date(task?.end_time).toLocaleString() || "Not specified"}
    ];

    // const userMenuOptions = [
    //     { id: "1", title: "Edit Assignment", icon: "pencil" },
    //     { id: "2", title: "Drop Assignment", icon: "delete" },
    // ];

    const openUserMenu = (user_id: string) => {
        setUserVisibleMenus((prev) => ({ ...prev, [user_id]: true}));
    };
    const closeUserMenu = (user_id: string) => {
        setUserVisibleMenus((prev) => ({ ...prev, [user_id]: false}));
    };
    
    const openTaskMenu = () => setTaskMenuVisible(true);
    const closeTaskMenu = () => setTaskMenuVisible(false);

    // const renderMenuOption = (item: { id: string; title: string; icon: string}) => (
    //     <TouchableOpacity style={styles.menuItem}>
    //         <IconButton icon={item.icon} size={20} style={styles.icon} />
    //         <Text style={styles.menuText}>{item.title}</Text>
    //     </TouchableOpacity>
    // );

    const renderItem = (item: {user_id: string; first_name: string; last_name: string; assignment_id: number}) => (
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
            style={styles.menuBox}
            >
                <Menu.Item title="Option 1" />
                <Menu.Item title="Option 2" />
                {/* <FlatList
                data={userMenuOptions}
                keyExtractor={(option) => option.id}
                renderItem={() => renderMenuOption(option)}
                ItemSeparatorComponent={() => <View style={styles.separatorMenu}/>}
                /> */}
            </Menu>
        </View>
    );
    
    return (
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
                >
                    <Menu.Item title="Option 1" />
                    <Menu.Item title="Option 2" />
                </Menu>
            </View>
            <Text style={styles.title}>{task?.task_name}</Text>
            <View style={styles.taskDataContainer}>
                <FlatList
                data={taskData}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={styles.label}>{item.key}</Text>
                        <Text style={styles.value}>{item.value}</Text>
                    </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator1} />}
                />
            </View>
            <FlatList
            data={task?.users || []}
            renderItem={({ item }) => renderItem(item)}
            keyExtractor={(item) => item.user_id}
            ItemSeparatorComponent={() => <View style={styles.separator2} />}
            ListEmptyComponent={
                <Text style={styles.emptyMessage}>No one signed up for this task</Text>
            }
            />
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        padding: 16,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginTop: 16,
    },
    menuBox: {
        backgroundColor: "#f8f8f8",
        borderRadius: 15,
        padding: 10,
        elevation: 5,
        backgroundBlendMode: "On"
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        // marginVertical: 16,
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
    details: {
        fontSize: 18,
        color: "#444",
        marginVertical: 4,
    },
    listItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#ffffff",
        borderRadius: 8,
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
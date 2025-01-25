import React from "react";
import { Modal, StyleSheet, View, Text, Button } from "react-native";

type ConfirmModalProps = {
    visible: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
};

const ConfirmModal = ({ visible, message, onConfirm, onCancel }: ConfirmModalProps) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modal}>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttonContainer}>
                        <Button title="Confirm" color="red" onPress={onConfirm} />
                        <Button title="Cancel" onPress={onCancel} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modal: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 15,
        width: "80%",
        alignItems: "center"
    },
    message: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%"
    }
});

export default ConfirmModal;
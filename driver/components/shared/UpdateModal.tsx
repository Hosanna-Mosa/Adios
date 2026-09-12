import React from "react";
import { Modal, View, Text, TouchableOpacity, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
import { styles } from "./UpdateModal.styles";
import { Colors } from "@/constants/colors";

interface UpdateModalProps {
  visible: boolean;
  forceUpdate: boolean;
  storeUrl: string;
  onDismiss: () => void;
}

export default function UpdateModal({ visible, forceUpdate, storeUrl, onDismiss }: UpdateModalProps) {
  if (!visible) return null;

  const handleUpdate = () => {
    Linking.openURL(storeUrl).catch(err => console.error("Failed to open store URL:", err));
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      hardwareAccelerated={true}
      onRequestClose={() => {
        onDismiss();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Feather name="download-cloud" size={40} color={Colors.white} />
          </View>

          <Text style={styles.title}>New Driver App Version!</Text>
          <Text style={styles.subtitle}>Update the FLAVOUR Driver app to continue receiving orders smoothly.</Text>

          {forceUpdate && (
            <View style={styles.warningContainer}>
              <Feather name="alert-triangle" size={16} color="#ef4444" />
              <Text style={styles.warningText}>This update is mandatory to continue online duties.</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} activeOpacity={0.85}>
              <Text style={styles.updateText}>Update Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterButton} onPress={onDismiss} activeOpacity={0.8}>
              <Text style={styles.laterText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

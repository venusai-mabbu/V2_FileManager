// components/ActionModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const options = ['Delete', 'Rename', 'Copy', 'Move','Paste'];

const ActionModal = ({ visible, onClose, onAction, selectedFile }) => {
  if (!selectedFile) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Choose Action for:</Text>
          <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name || selectedFile.uri}</Text>

          {options.map((option, index) => (
            <TouchableOpacity
              key={option}
              style={styles.button}
              onPress={() => {
                onAction(selectedFile, index);
                onClose();
              }}
            >
              <Text style={[styles.buttonText, option === 'Delete' && { color: 'red' }]}>{option}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={[styles.buttonText, { color: 'gray' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ActionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end'
  },
  container: {
    backgroundColor: 'white', padding: 20,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  fileName: { fontSize: 14, marginBottom: 15, color: '#444' },
  button: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  buttonText: { fontSize: 16 },
});

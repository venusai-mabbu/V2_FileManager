import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const RenameModal = ({ visible, file, onClose, onRename }) => {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (file) {
      const currentName = file?.split('/').pop() || '';
      setNewName(currentName);
    }
  }, [file]);

  const handleRename = () => {
    if (newName.trim()) {
      onRename(newName.trim());
    }
  };

  if (!file) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Rename Item</Text>
          <Text style={styles.pathText}>{file}</Text>
          <Text style={styles.pathText}>{newName}</Text>

          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder="Enter new name"
            autoFocus
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRename} style={styles.button}>
              <Text style={styles.renameText}>Rename</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RenameModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '85%',
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pathText: {
    fontSize: 12,
    color: '#777',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: 15,
  },
  cancelText: {
    color: 'red',
    fontSize: 16,
  },
  renameText: {
    color: 'blue',
    fontSize: 16,
  },
});

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Folder as FileFolder, File, X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface CreateModalProps {
  visible: boolean;
  type: 'file' | 'folder';
  onClose: () => void;
  onCreate: (name: string, content?: string) => void;
}

export default function CreateModal({ visible, type, onClose, onCreate }: CreateModalProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const { colors } = useTheme();

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Error', `Please enter a ${type} name`);
      return;
    }

    let finalName = name.trim();
    if (type === 'file' && !finalName.includes('.')) {
      finalName += '.txt';
    }

    onCreate(finalName, type === 'file' ? content : undefined);
    setName('');
    setContent('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setContent('');
    onClose();
  };

  const styles = createStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            {type === 'folder' ? (
              <FileFolder size={24} color={colors.primary} />
            ) : (
              <File size={24} color={colors.primary} />
            )}
            {/* <Text style={styles.title}>Create {type === 'folder' ? 'Folder' : 'File'}</Text> */}
            <Text style={styles.title}>Create </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder={`Enter ${type} name`}
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
            selectTextOnFocus
          />

          {type === 'file' && (
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Enter file content (optional)"
              placeholderTextColor={colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}
          
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.createButton, { backgroundColor: colors.primary }]} 
              onPress={handleCreate}
            >
              <Text style={styles.createText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  contentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
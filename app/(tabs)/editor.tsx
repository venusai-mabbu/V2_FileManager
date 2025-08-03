import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,Pressable
} from 'react-native';
import { Save, FileText, FolderOpen, Plus } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '@/context/ThemeContext';
import { useFileSystem } from '@/context/FileSystemContext';
import { readFileContent, writeFileContent, createFile } from '@/utils/fileUtils';

import { useRoute } from '@react-navigation/native';



export default function TextEditor() {
  
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { currentPath, refreshFiles } = useFileSystem();

  const route = useRoute();
  
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaveModalVisible, setSaveModalVisible] = useState(false);
  const [tempFileName, setTempFileName] = useState('new-file.txt');
 
  const { fileUri,  filename, fileContent } = route.params || {};

  useEffect(() => {
    if (fileUri ) {
      setCurrentFile(fileUri);
      setFileName(filename || 'untitled.txt');
      setContent(fileContent);
      setHasUnsavedChanges(false);
    }
  }, [fileUri, fileContent]);


  const openFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/*',
        copyToCacheDirectory: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        if (asset.mimeType?.startsWith('text/')) {
          const fileContent = await readFileContent(asset.uri);
          setContent(fileContent);
          setFileName(asset.name);
          setCurrentFile(asset.uri);
          setHasUnsavedChanges(false);
        } else {
          Alert.alert('Error', 'Please select a text file');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open file');
    }
  };

  const saveFile = async () => {
    if (!fileName || !fileName.trim()) {
      setTempFileName('new-file.txt');
      setSaveModalVisible(true);
      return;
    }

    await saveFileWithName(fileName);
  };

  const saveFileWithName = async (name: string) => {
    try {
      let finalName = name;
      if (!finalName.includes('.')) {
        finalName += '.txt';
      }

      const filePath = currentFile || `${currentPath}/${finalName}`;
      await writeFileContent(filePath, content);

      setFileName(finalName);
      setCurrentFile(filePath);
      setHasUnsavedChanges(false);
      await refreshFiles();

      Alert.alert('Success', `${finalName} saved successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save file');
    }
  };

  const newFile = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save before creating a new file?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: "Don't Save", onPress: createNewFile },
          { text: 'Save', onPress: async () => { await saveFile(); createNewFile(); } },
        ]
      );
    } else {
      createNewFile();
    }
  };

  const createNewFile = () => {
    setContent('');
    setFileName('');
    setCurrentFile(null);
    setHasUnsavedChanges(false);
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    setHasUnsavedChanges(true);
  };

  const handleSaveFromModal = async () => {
    if (!tempFileName.trim()) {
      Alert.alert('Error', 'Filename cannot be empty');
      return;
    }
    await saveFileWithName(tempFileName.trim());
    setSaveModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Text Editor</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={newFile}>
              <Plus size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={openFile}>
              <FolderOpen size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, hasUnsavedChanges && styles.saveButtonActive]}
              onPress={saveFile}
            >
              <Save size={20} color={hasUnsavedChanges ? colors.primary : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fileInfo}>
          <FileText size={16} color={colors.textSecondary} />
          <Text style={styles.fileName}>
            {fileName || 'Untitled'}{hasUnsavedChanges && ' *'}
          </Text>
        </View>

        <View style={styles.editorContainer}>
          <ScrollView style={styles.editorScroll} showsVerticalScrollIndicator={false}>
            <TextInput
              style={styles.editor}
              value={content}
              onChangeText={handleContentChange}
              placeholder="Start typing..."
              placeholderTextColor={colors.textSecondary}
              multiline
              textAlignVertical="top"
              autoCapitalize="sentences"
              autoCorrect
              spellCheck
            />
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {content.length} characters • {content.split('\n').length} lines
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Save Modal */}

      <Modal
        animationType="slide"
        transparent
        visible={isSaveModalVisible}
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setSaveModalVisible(false)} // dismiss when pressing outside
        >
          <Pressable
            onPress={() => {}} // stop propagation
            style={{
              backgroundColor: colors.surface,
              padding: 20,
              borderRadius: 10,
              width: '80%',
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 10, color: colors.text }}>
              Enter file name
            </Text>
            <TextInput
              value={tempFileName}
              onChangeText={setTempFileName}
              placeholder="Filename"
              placeholderTextColor={colors.textSecondary}
              autoFocus
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                padding: 10,
                borderRadius: 5,
                marginBottom: 15,
                color: colors.text,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setSaveModalVisible(false)}>
                <Text style={{ marginRight: 20, color: 'red' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveFromModal}>
                <Text style={{ color: 'blue' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
  },
  saveButtonActive: {
    backgroundColor: colors.primary + '20',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fileName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  editorContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  editorScroll: {
    flex: 1,
  },
  editor: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    minHeight: 400,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
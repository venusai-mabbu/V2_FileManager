import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { ArrowLeft, Plus, Grid3x3 as Grid3X3, List, Upload, Menu, Import as SortAsc } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '@/context/ThemeContext';
import { useFileSystem } from '@/context/FileSystemContext';
import { useSettings } from '@/context/SettingsContext';
import FileItem from '@/components/FileItem';
import SearchBar from '@/components/SearchBar';
import CreateModal from '@/components/CreateModal';
import { FileItem as FileItemType, SortBy, SortOrder } from '@/types/file';
import { createDirectory, createFile, deleteItem } from '@/utils/fileUtils';

export default function FileExplorer() {
  const { colors } = useTheme();
  const { 
    currentPath, 
    files, 
    loading, 
    refreshFiles, 
    addToRecent 
  } = useFileSystem();
  const { settings, updateSettings } = useSettings();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const navigationHistory = useState<string[]>([currentPath])[0];

  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      // Always put folders first
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;

      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = (a.modificationTime || 0) - (b.modificationTime || 0);
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'type':
          comparison = (a.extension || '').localeCompare(b.extension || '');
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [files, searchQuery, sortBy, sortOrder]);

  const canGoBack = () => {
    const basePath = `${FileSystem.documentDirectory}FileExplorer/`;
    return currentPath !== basePath;
  };

  const goBack = () => {
    if (canGoBack()) {
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
      navigateToDirectory(parentPath);
    }
  };

  const navigateToDirectory = (path: string) => {
    if (path !== currentPath) {
      refreshFiles();
    }
  };

  const handleFilePress = async (file: FileItemType) => {
    if (file.isDirectory) {
      navigateToDirectory(file.uri);
    } else {
      addToRecent(file.uri);
      // Handle file opening based on type
      if (file.extension === 'txt' || file.extension === 'md') {
        // Navigate to text editor
        Alert.alert('Info', 'Text editing will open in the Editor tab');
      } else {
        Alert.alert('File Info', `Selected: ${file.name}\nSize: ${file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown'}`);
      }
    }
  };

  const handleFileLongPress = (file: FileItemType) => {
    const options = ['Delete', 'Rename', 'Copy', 'Move', 'Cancel'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 4;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
          title: file.name,
        },
        (buttonIndex) => {
          handleFileAction(file, buttonIndex);
        }
      );
    } else {
      Alert.alert(
        file.name,
        'Choose an action',
        [
          { text: 'Delete', onPress: () => handleFileAction(file, 0), style: 'destructive' },
          { text: 'Rename', onPress: () => handleFileAction(file, 1) },
          { text: 'Copy', onPress: () => handleFileAction(file, 2) },
          { text: 'Move', onPress: () => handleFileAction(file, 3) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleFileAction = async (file: FileItemType, actionIndex: number) => {
    switch (actionIndex) {
      case 0: // Delete
        Alert.alert(
          'Confirm Delete',
          `Are you sure you want to delete "${file.name}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteItem(file.uri);
                  await refreshFiles();
                } catch (error) {
                  Alert.alert('Error', 'Failed to delete item');
                }
              },
            },
          ]
        );
        break;
      case 1: // Rename
        Alert.prompt(
          'Rename',
          `Enter new name for "${file.name}"`,
          async (newName) => {
            if (newName && newName.trim()) {
              try {
                const newPath = `${currentPath}/${newName.trim()}`;
                await FileSystem.moveAsync({ from: file.uri, to: newPath });
                await refreshFiles();
              } catch (error) {
                Alert.alert('Error', 'Failed to rename item');
              }
            }
          },
          'plain-text',
          file.name
        );
        break;
    }
  };

  const handleCreateFile = async (name: string, content?: string) => {
    try {
      const filePath = `${currentPath}/${name}`;
      await createFile(filePath, content || '');
      await refreshFiles();
      Alert.alert('Success', `${name} created successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create file');
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const folderPath = `${currentPath}/${name}`;
      await createDirectory(folderPath);
      await refreshFiles();
      Alert.alert('Success', `${name} created successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to create folder');
    }
  };

  const handleCreate = (name: string, content?: string) => {
    if (createType === 'file') {
      handleCreateFile(name, content);
    } else {
      handleCreateFolder(name);
    }
  };

  const handleImportFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.name;
        const destinationPath = `${currentPath}/${fileName}`;
        
        await FileSystem.copyAsync({
          from: asset.uri,
          to: destinationPath,
        });
        
        await refreshFiles();
        Alert.alert('Success', `${fileName} imported successfully`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import file');
    }
  };

  const toggleViewMode = () => {
    updateSettings({ gridView: !settings.gridView });
  };

  const showCreateOptions = () => {
    const options = ['Create File', 'Create Folder', 'Import File', 'Cancel'];
    const cancelButtonIndex = 3;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              setCreateType('file');
              setCreateModalVisible(true);
              break;
            case 1:
              setCreateType('folder');
              setCreateModalVisible(true);
              break;
            case 2:
              handleImportFile();
              break;
          }
        }
      );
    } else {
      Alert.alert(
        'Create',
        'Choose an option',
        [
          { text: 'Create File', onPress: () => { setCreateType('file'); setCreateModalVisible(true); } },
          { text: 'Create Folder', onPress: () => { setCreateType('folder'); setCreateModalVisible(true); } },
          { text: 'Import File', onPress: handleImportFile },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const getCurrentDirectoryName = () => {
    const parts = currentPath.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'Root';
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {canGoBack() && (
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{getCurrentDirectoryName()}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setSortBy(sortBy === 'name' ? 'date' : 'name')}>
            <SortAsc size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={toggleViewMode}>
            {settings.gridView ? (
              <List size={20} color={colors.textSecondary} />
            ) : (
              <Grid3X3 size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={showCreateOptions}>
            <Plus size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
      />

      <FlatList
        data={filteredAndSortedFiles}
        renderItem={({ item }) => (
          <FileItem
            file={item}
            onPress={handleFilePress}
            onLongPress={handleFileLongPress}
            isGridView={settings.gridView}
          />
        )}
        keyExtractor={(item) => item.uri}
        numColumns={settings.gridView ? 2 : 1}
        key={settings.gridView ? 'grid' : 'list'}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshFiles} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      />

      <CreateModal
        visible={createModalVisible}
        type={createType}
        onClose={() => setCreateModalVisible(false)}
        onCreate={handleCreate}
      />
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
});
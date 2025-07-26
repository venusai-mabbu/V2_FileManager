import React, { useState, useMemo,useEffect } from 'react';
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

import {
  ArrowLeft,
  Plus,
  Home,
  Grid3x3 as Grid3X3,
  List,
  Import as SortAsc,
} from 'lucide-react-native';
import { Camera as CameraIcon } from 'lucide-react-native';

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { useFileSystem } from '@/context/FileSystemContext';
import { useSettings } from '@/context/SettingsContext';
import FileItem from '@/components/FileItem';
import SearchBar from '@/components/SearchBar';
import CreateModal from '@/components/CreateModal';
import { FileItem as FileItemType, SortBy, SortOrder } from '@/types/file';
import { createDirectory, createFile, deleteItem } from '@/utils/fileUtils';
import { readFileContent } from '@/utils/fileUtils';
import { useRouter } from 'expo-router';
import ViewPic from '../../components/ViewPic';


export default function FileExplorer() {
  const router = useRouter();

  const { colors } = useTheme();
  const {
    currentPath,
    files,
    loading,
    refreshFiles,
    addToRecent,
    setCurrentPath,
  } = useFileSystem();
  const { settings, updateSettings } = useSettings();
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showViewer, setShowViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);


useEffect(() => {
  refreshFiles();
}, [currentPath]);

  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files;

    if (searchQuery.trim()) {
      filtered = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
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
  const goToHome = () => {
          navigateToDirectory(`${FileSystem.documentDirectory}FileExplorer/`);
  };

 const navigateToDirectory = (path: string) => {
  if (path !== currentPath) {
    setCurrentPath(path);
    refreshFiles(path); // ✅ use updated path directly
  }
  setSearchQuery("");
};


const handleFilePress = async (file: FileItemType) => {
  if (file.isDirectory) {
    navigateToDirectory(file.uri);
  } else {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const textExtensions = ['txt', 'md', 'json', 'log'];
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp','svg'];

    if (textExtensions.includes(extension)) {
      try {
        const content = await readFileContent(file.uri); // ✅ read the file content
        navigation.navigate('editor', {
          fileUri: file.uri,
          filename: file.name,
          fileContent: content,
        });
      } catch (err) {
        Alert.alert('Error', 'Failed to read file');
      }
    } 
    else if (imageExtensions.includes(extension)) 
    {
            //Alert.alert('Image Info',`Selected: ${file.name}\nSize: ${file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown'}`);
            setSelectedImage(file.uri);
            setShowViewer(true);
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
        // file.name,
         file.uri,
        'Choose an action',
        [
          { text: 'Delete', onPress: () => handleFileAction(file, 0), style: 'destructive' },
          // { text: 'Move', onPress: () => handleFileAction(file, 3) },
          // { text: 'Copy', onPress: () => handleFileAction(file, 2) },
          { text: 'Rename', onPress: () => handleFileAction(file, 1) },
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
          `Are you sure you want to delete "${typeof file.uri}"?`,   //string
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
        // TODO: Replace with a custom rename modal like CreateModal
        Alert.alert('Rename not supported on Android yet', 'Use modal to enter new name.');
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

        await FileSystem.copyAsync({ from: asset.uri, to: destinationPath });
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
        { options, cancelButtonIndex },
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
          // Alert.alert('Create', 'Choose an option', [
          //   { text: 'Create File', onPress: () => { setCreateType('file'); setCreateModalVisible(true); } },
          //   { text: 'Create Folder', onPress: () => { setCreateType('folder'); setCreateModalVisible(true); } },
          //   { text: 'Import File', onPress: handleImportFile },
          //   { text: 'Cancel', style: 'cancel' },
          // ]);
              Alert.alert('Create new', 'Choose an option', [
              {
                text: 'New File/Folder',
                onPress: () =>
                  Alert.alert('Create new File/Folder', '', [
                    { text: 'Create File', onPress: () => { setCreateType('file'); setCreateModalVisible(true); }  },
                    { text: 'Create Folder', onPress: () => { setCreateType('folder'); setCreateModalVisible(true); }  },
                    { text: 'Cancel', style: 'cancel' },
                  ]),
              },
              { text: 'Import File', onPress: handleImportFile },
              { text: 'Cancel', style: 'cancel' },
            ]);
      }
    };

  const getCurrentDirectoryName = () => {
    const parts = currentPath.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'Root';
  };
  const getSimplified = (path: string) => {
  const marker = 'FileExplorer//';
  const index = path.indexOf(marker);
  if (index !== -1) {
    return path.substring(index ); // returns part after "FileExplorer/"
  }
  return path; // fallback if "FileExplorer/" not found
};

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {canGoBack() ? (
            <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ): <TouchableOpacity style={styles.backButton} onPress={goBack}>
              <Home size={24} color={colors.text} />
            </TouchableOpacity>
          }
          {/* <Text style={styles.headerTitle}>{getCurrentDirectoryName()}</Text> */}
          <Text style={styles.headerTitle} onPress={goToHome}>VSFileManager</Text>
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

          <TouchableOpacity style={styles.headerButton} onPress={() => router.push({ pathname: '/cam2', params: { currentPath } })}>
            <CameraIcon size={24} color={colors.textSecondary} />            
            {/* <Text style={styles.headerTitle} onPress={() => router.push({ pathname: '/cam2', params: { currentPath } })}>
              Camera</Text>   */}

          </TouchableOpacity>

        </View>
      </View>

      <View style={styles.pathBar}>
        {(canGoBack())&&<Text style={styles.pathText} numberOfLines={1} ellipsizeMode="middle">
          {getSimplified(currentPath)}
        </Text>}
      </View>

      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} onClearSearch={() => setSearchQuery('')}/>
       
        {selectedImage && (
        <ViewPic
          visible={showViewer}
          image={selectedImage}
          onClose={() => setShowViewer(false)}
          //onInfo={()=> Alert.alert('Image Info',`Selected: ${selectedImage}\nSize:'Unknown'`)}
         // onDelete={() => setShowViewer(false)}   //(file, 0)
        />
      )}

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
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshFiles} tintColor={colors.primary} />}
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
    marginTop:30,
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
  pathBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pathText: {
    fontSize: 15,
    paddingTop:7,
    color: colors.textSecondary,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
});
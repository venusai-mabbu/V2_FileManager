import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Folder as FileFolder, File, Image as ImageIcon } from 'lucide-react-native';
import { FileItem as FileItemType } from '../types/file';
import { getFileType } from '../constants/FileTypes';
import { formatFileSize, formatDate, isImageFile } from '../utils/fileUtils';
import { useTheme } from '../context/ThemeContext';

interface FileItemProps {
  file: FileItemType;
  onPress: (file: FileItemType) => void;
  onLongPress: (file: FileItemType) => void;
  isGridView?: boolean;
}

export default function FileItem({ file, onPress, onLongPress, isGridView = false }: FileItemProps) {
  const { colors } = useTheme();
  const fileType = getFileType(file.name);

  const renderIcon = () => {
    if (file.isDirectory) {
      return <FileFolder size={isGridView ? 43 : 32} color={colors.primary} />;
    }

    if (isImageFile(file.name)) {
      return (
        <Image
          source={{ uri: file.uri }}
          style={isGridView ? styles.gridThumbnail : styles.listThumbnail}
          resizeMode="cover"
        />
      );
    }

    return <File size={isGridView ? 40 : 28} color={fileType.color} />;
  };

  const styles = createStyles(colors, isGridView);

  if (isGridView) {
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => onPress(file)}
        onLongPress={() => onLongPress(file)}
        activeOpacity={0.7}
      >
        <View style={styles.gridIconContainer}>
          {renderIcon()}
        </View>
        <Text style={styles.gridFileName} numberOfLines={2}>
          {file.name}
        </Text>
        {!file.isDirectory && file.size && (
          <Text style={styles.gridFileSize}>
            {formatFileSize(file.size)} MB
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => onPress(file)}
      onLongPress={() => onLongPress(file)}
      activeOpacity={0.7}
    >
      <View style={styles.listIconContainer}>
        {renderIcon()}
      </View>
      
      <View style={styles.listContent}>
        <Text style={styles.listFileName} numberOfLines={1}>
          {file.name}
        </Text>
        <View style={styles.listDetails}>
          {!file.isDirectory && file.size && (
            <Text style={styles.listFileSize}>
              {formatFileSize(file.size)}
            </Text>
          )}
          {file.modificationTime && (
            <Text style={styles.listFileDate}>
              {formatDate(file.modificationTime)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any, isGridView: boolean) => StyleSheet.create({
  gridItem: {
    width: '48%',
    backgroundColor: colors.surface,
    position:'relative',
    borderRadius: 12,
    padding: 16,
    marginHorizontal:6,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    
  },
  gridIconContainer: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,

  },
  gridFileName: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
  gridFileSize: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow:'hidden'
  },
  listIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    //overflow:'hidden'
  },
  listThumbnail: {
    width: 59,
    height: 59,
    borderRadius: 6,
  },
  listContent: {
    flex: 1,
  },
  listFileName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  listDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listFileSize: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 12,
  },
  listFileDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
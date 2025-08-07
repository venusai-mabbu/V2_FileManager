import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StyleSheetProperties,
} from 'react-native';
import { Folder as FileFolder, File } from 'lucide-react-native';
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
  const styles = createStyles(colors, isGridView);
  const isImage = isImageFile(file.name);

  if (isGridView) {
    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => onPress(file)}
        onLongPress={() => onLongPress(file)}
        activeOpacity={0.8}
      >
        {/* Background image for image files */}
        {isImage && (
          <Image
            source={{ uri: file.uri }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        )}

        {/* File size overlay on top right for images */}
        {!file.isDirectory && isImage && file.size && (
          <View style={styles.gridOverlay}>
            <Text style={styles.gridOverlayText}>
              {formatFileSize(file.size)}
            </Text>
          </View>
        )}

        {/* Non-image content */}
        {!isImage && (
          <View style={styles.gridIconOnlyContainer}>
            <View style={styles.gridIconContainer}>
              {file.isDirectory ? (
                <FileFolder size={48} color={colors.primary} />
              ) : (
                <File size={44} color={fileType.color} />
              )}
            </View>

            <View style={styles.gridMetaBottom}>
              <Text style={styles.gridFileName} numberOfLines={2}>
                {file.name}
              </Text>
              {!file.isDirectory && (
                <Text style={styles.gridFileSize}>
                    {formatFileSize(file.size)}
                </Text>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // --- List View ---
  return (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => onPress(file)}
      onLongPress={() => onLongPress(file)}
      activeOpacity={0.7}
    >
      <View style={styles.listIconContainer}>
        {file.isDirectory ? (
          <FileFolder size={32} color={colors.primary} />
        ) : isImage ? (
          <Image
            source={{ uri: file.uri }}
            style={styles.listThumbnail}
            resizeMode="cover"
          />
        ) : (
          <File size={28} color={fileType.color} />
        )}
      </View>

      <View style={styles.listContent}>
        <Text style={styles.listFileName} numberOfLines={1}>
          {file.name}
        </Text>
        <View style={styles.listDetails}>
          {!file.isDirectory && (
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
  // --- GRID VIEW ---
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridIconOnlyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridMetaBottom: {
    position: 'absolute',
    bottom: 10,
    left: 8,
    right: 8,
    alignItems: 'center',
  },
  gridFileName: {
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 2,
  },
  gridFileSize: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  gridOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  gridOverlayText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },

  // --- LIST VIEW ---
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  listIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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

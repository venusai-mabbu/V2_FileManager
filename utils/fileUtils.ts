import * as FileSystem from 'expo-file-system';
import { FileItem } from '../types/file';
import { getFileType } from '../constants/FileTypes';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString();
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  return imageExtensions.includes(getFileExtension(filename));
};

export const isVideoFile = (filename: string): boolean => {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  return videoExtensions.includes(getFileExtension(filename));
};

export const readDirectory = async (path: string): Promise<FileItem[]> => {
  try {
    const items = await FileSystem.readDirectoryAsync(path);
    const fileItems: FileItem[] = [];

    for (const item of items) {
      const itemPath = `${path}/${item}`;
      const info = await FileSystem.getInfoAsync(itemPath);
      
      fileItems.push({
        name: item,
        uri: itemPath,
        type: info.isDirectory ? 'folder' : 'file',
        size: info.size,
        modificationTime: info.modificationTime,
        isDirectory: info.isDirectory,
        extension: info.isDirectory ? undefined : getFileExtension(item),
        mimeType: info.isDirectory ? undefined : getFileType(item).type,
      });
    }

    return fileItems;
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
};

export const createDirectory = async (path: string): Promise<void> => {
  try {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  } catch (error) {
    console.error('Error creating directory:', error);
    throw error;
  }
};

export const createFile = async (path: string, content: string = ''): Promise<void> => {
  try {
    await FileSystem.writeAsStringAsync(path, content);
  } catch (error) {
    console.error('Error creating file:', error);
    throw error;
  }
};

export const deleteItem = async (path: string): Promise<void> => {
  try {
    await FileSystem.deleteAsync(path);
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

export const moveItem = async (from: string, to: string): Promise<void> => {
  try {
    await FileSystem.moveAsync({ from, to });
  } catch (error) {
    console.error('Error moving item:', error);
    throw error;
  }
};

export const copyItem = async (from: string, to: string): Promise<void> => {
  try {
    await FileSystem.copyAsync({ from, to });
  } catch (error) {
    console.error('Error copying item:', error);
    throw error;
  }
};

export const readFileContent = async (path: string): Promise<string> => {
  try {
    return await FileSystem.readAsStringAsync(path);
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

export const writeFileContent = async (path: string, content: string): Promise<void> => {
  try {
    await FileSystem.writeAsStringAsync(path, content);
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
};
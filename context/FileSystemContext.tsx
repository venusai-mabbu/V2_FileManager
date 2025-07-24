import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as FileSystem from 'expo-file-system';
import { FileItem } from '../types/file';
import { readDirectory, createDirectory } from '../utils/fileUtils';

interface FileSystemContextType {
  currentPath: string;
  files: FileItem[];
  loading: boolean;
  error: string | null;
  recentFiles: string[];
  setCurrentPath: (path: string) => void;
  refreshFiles: () => Promise<void>;
  addToRecent: (filePath: string) => void;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};

const APP_DIRECTORY = `${FileSystem.documentDirectory}FileExplorer/`;
const CAMERA_DIRECTORY = `${APP_DIRECTORY}Camera/`;
const DOCUMENTS_DIRECTORY = `${APP_DIRECTORY}Documents/`;


interface FileSystemProviderProps {
  children: ReactNode;
}

export const FileSystemProvider: React.FC<FileSystemProviderProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(APP_DIRECTORY);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);

  const initializeDirectories = async () => {
    try {
      const directories = [APP_DIRECTORY, CAMERA_DIRECTORY, DOCUMENTS_DIRECTORY];
      for (const dir of directories) {
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (!dirInfo.exists) {
          await createDirectory(dir);
        }
      }
    } catch (error) {
      console.error('Error initializing directories:', error);
    }
  };

  const refreshFiles = async (path = currentPath) => {
  //setLoading(true);
  setError(null);

  try {
    const fileItems = await readDirectory(path);
    setFiles(fileItems);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load files');
  } finally {
    setLoading(false);
  }
};


  const addToRecent = (filePath: string) => {
    setRecentFiles(prev => {
      const filtered = prev.filter(path => path !== filePath);
      return [filePath, ...filtered].slice(0, 10);
    });
  };

  useEffect(() => {
    initializeDirectories();
  }, []);

  useEffect(() => {
    refreshFiles();
  }, [currentPath]);

  const value: FileSystemContextType = {
    currentPath,
    files,
    loading,
    error,
    recentFiles,
    setCurrentPath,
    refreshFiles,
    addToRecent,
  };

  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  );
};
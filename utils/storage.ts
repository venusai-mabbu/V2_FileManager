import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types/settings';

const SETTINGS_KEY = '@FileExplorer:settings';
const RECENT_FILES_KEY = '@FileExplorer:recentFiles';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  showHiddenFiles: false,
  defaultSort: {
    by: 'name',
    order: 'asc',
  },
  gridView: false,
  autoBackup: false,
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
    if (settingsJson) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return DEFAULT_SETTINGS;
};

export const saveRecentFiles = async (files: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(RECENT_FILES_KEY, JSON.stringify(files.slice(0, 10)));
  } catch (error) {
    console.error('Error saving recent files:', error);
  }
};

export const loadRecentFiles = async (): Promise<string[]> => {
  try {
    const recentFilesJson = await AsyncStorage.getItem(RECENT_FILES_KEY);
    if (recentFilesJson) {
      return JSON.parse(recentFilesJson);
    }
  } catch (error) {
    console.error('Error loading recent files:', error);
  }
  return [];
};
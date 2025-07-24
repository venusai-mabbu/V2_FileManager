import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Sun, Moon, Smartphone, Grid3x3 as Grid3X3, List, RotateCcw, Info, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSettings } from '@/context/SettingsContext';

export default function SettingsScreen() {
  const { colors, theme, setTheme } = useTheme();
  const { settings, updateSettings, resetSettings } = useSettings();

  const styles = createStyles(colors);

  const themeOptions = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'auto', label: 'Auto', icon: Smartphone },
  ];

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetSettings();
            Alert.alert('Success', 'Settings have been reset to default');
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'File Explorer',
      'Version 1.0.0\n\nA powerful file manager with camera integration and text editing capabilities.\n\nBuilt with Expo and React Native.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>Theme</Text>
            <View style={styles.themeOptions}>
              {themeOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = theme === option.key;
                
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.themeOption,
                      isSelected && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                    ]}
                    onPress={() => setTheme(option.key as any)}
                  >
                    <IconComponent 
                      size={20} 
                      color={isSelected ? colors.primary : colors.textSecondary} 
                    />
                    <Text 
                      style={[
                        styles.themeOptionText,
                        { color: isSelected ? colors.primary : colors.text }
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* View Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>File Display</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              {settings.gridView ? (
                <Grid3X3 size={20} color={colors.textSecondary} />
              ) : (
                <List size={20} color={colors.textSecondary} />
              )}
              <Text style={styles.settingItemLabel}>Grid View</Text>
            </View>
            <Switch
              value={settings.gridView}
              onValueChange={(value) => updateSettings({ gridView: value })}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={settings.gridView ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              {settings.showHiddenFiles ? (
                <Eye size={20} color={colors.textSecondary} />
              ) : (
                <EyeOff size={20} color={colors.textSecondary} />
              )}
              <Text style={styles.settingItemLabel}>Show Hidden Files</Text>
            </View>
            <Switch
              value={settings.showHiddenFiles}
              onValueChange={(value) => updateSettings({ showHiddenFiles: value })}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={settings.showHiddenFiles ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleResetSettings}>
            <RotateCcw size={20} color={colors.error} />
            <Text style={[styles.actionItemLabel, { color: colors.error }]}>
              Reset Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleAbout}>
            <Info size={20} color={colors.textSecondary} />
            <Text style={styles.actionItemLabel}>About</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
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
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  settingGroup: {
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionItemLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
});
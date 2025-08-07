import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  Vibration,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera as CameraIcon, SwitchCamera } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';

import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '@/context/ThemeContext';
import { useFileSystem } from '@/context/FileSystemContext';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { colors } = useTheme();
  const { refreshFiles } = useFileSystem();

  const styles = createStyles(colors);

  const { currentPath } = useLocalSearchParams();


  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <CameraIcon size={64} color={colors.textSecondary} />
          <Text style={styles.permissionText}>
            Camera access is required to take photos
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (isTakingPhoto || !cameraRef.current || !isCameraReady) {
      return;
    }

    setIsTakingPhoto(true);

    // Add haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }

    try {
        const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: true, // optional: reduces image processing delay
      });

      if (!photo || !photo.uri) {
        throw new Error('Failed to capture photo');
      }

      // Create filesystem-friendly timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .split('.')[0]; // Remove milliseconds
      const filename = `IMG_${timestamp}.jpg`;
      //const appDirectory = `${FileSystem.documentDirectory}FileExplorer/DCIM/Venu/`;
      const appDirectory = currentPath+'/';

      const finalPath = `${appDirectory}${filename}`;

      // Ensure directory exists
      const dirInfo = await FileSystem.getInfoAsync(appDirectory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(appDirectory, { intermediates: true });
      }
     
      // Copy photo to app directory
      await FileSystem.copyAsync({
        from: photo.uri,
        to: finalPath,
      });

      // Save to device gallery (non-web platforms only)
      if (Platform.OS !== 'web') {
        try {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === 'granted') {
            await MediaLibrary.createAssetAsync(photo.uri);
          }
        } catch (mediaError) {
          // Non-critical error - photo is still saved to app directory
          console.warn('Could not save to gallery:', mediaError);
        }
      }

      // Refresh file system
      await refreshFiles();
      
      // Alert.alert(
      //   'Success', 
      //   Platform.OS === 'web' 
      //     ? `Photo saved as ${filename}` 
      //     : `Photo saved as ${filename} and added to gallery`
      // );

    } catch (error) {
      console.error('Error taking picture:', error);
      
      let errorMessage = 'Failed to take picture';
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage = 'Camera permission denied';
        } else if (error.message.includes('storage')) {
          errorMessage = 'Storage permission denied';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error occurred';
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
    
    // Add haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate(30);
    }
  };

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const handleCameraError = (error: any) => {
    console.error('Camera error:', error);
    Alert.alert('Camera Error', 'There was an issue with the camera. Please try again.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera Preview */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onCameraReady={handleCameraReady}
        onMountError={handleCameraError}
      />

      {/* Overlay UI */}
      <View style={styles.overlay}>
        <View style={styles.topControls}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={toggleCameraFacing}
            activeOpacity={0.7}
          >
            <SwitchCamera size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity 
            style={[
              styles.captureButton, 
              isTakingPhoto && styles.captureButtonPressed
            ]} 
            onPress={takePicture}
            activeOpacity={0.8}
            disabled={!isCameraReady || isTakingPhoto}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          
          {!isCameraReady && (
            <Text style={styles.cameraStatusText}>Preparing camera...</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    permissionText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      marginVertical: 24,
      lineHeight: 24,
    },
    permissionButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    permissionButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    camera: {
      flex: 1,
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    overlay: {
      flex: 1,
      justifyContent: 'space-between',
    },
    topControls: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingTop: 50,
      paddingHorizontal: 20,
    },
    controlButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottomControls: {
      alignItems: 'center',
      paddingBottom: 50,
    },
    captureButton: {
      width: 75,
      height: 75,
      borderRadius: 37.5,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: 'white',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    captureButtonPressed: {
      transform: [{ scale: 0.95 }],
      opacity: 0.8,
    },
    captureButtonInner: {
      width: 55,
      height: 55,
      borderRadius: 27.5,
      backgroundColor: 'white',
    },
    cameraStatusText: {
      color: 'white',
      fontSize: 14,
      marginTop: 12,
      textAlign: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
  });
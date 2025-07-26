import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Platform,Alert
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useFileSystem } from '@/context/FileSystemContext';

import { Info, Trash2, X } from 'lucide-react-native'; // Expo-compatible icons
import {  deleteItem } from '@/utils/fileUtils';

const ViewPic = ({ visible, image, onClose }) => {
  const images = [{ url: image}];
  
  const { refreshFiles } = useFileSystem();
  const  deleteImage=async function(file)
  {
     Alert.alert(
              'Confirm Delete',
              `Are you sure you want to delete ?${typeof file}`,  
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteItem(file);
                      await refreshFiles();
                      onClose();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to delete item');
                    }
                  },
                },
              ]
            );
  }
  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <View style={styles.fullScreen}>
        <ImageViewer
          imageUrls={images}
          enableSwipeDown={true}
          onSwipeDown={onClose}
          renderIndicator={() => null}
          saveToLocalByLongPress={false}
          backgroundColor="black"
          style={styles.fullScreen}
        />

        {/* Top-right controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={()=>Alert.alert('',image)} style={styles.iconButton}>
            <Info color="white" size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>deleteImage(image)} style={styles.iconButton}>
            <Trash2 color="white" size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <X color="white" size={28} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ViewPic;

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: 'black',
  },
  controls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    zIndex: 10,
  },
  iconButton: {
    marginLeft: 12,
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
});

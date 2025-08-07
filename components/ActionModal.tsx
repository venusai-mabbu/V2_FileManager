import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable,
} from 'react-native';

import {
  Trash2,
  Pencil,
  Copy,
  Move,
} from 'lucide-react-native';

const actionIcons = [
  { label: 'Delete', icon: Trash2, color: 'red' },
  { label: 'Rename', icon: Pencil, color: '#333' },
  { label: 'Copy', icon: Copy, color: '#333' },
  { label: 'Move', icon: Move, color: '#333' },
];

const ActionModal = ({ visible, onClose, onAction, selectedFile }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80) {
          onClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!visible || !selectedFile) return null;

  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.overlay, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.dragHandle} />
        <Text style={styles.title}>Choose Action for:</Text>
        <Text style={styles.fileName} numberOfLines={1}>
          {selectedFile.name || selectedFile.uri}
        </Text>

        <View style={styles.actionsRow}>
          {actionIcons.map((action, index) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={action.label}
                style={styles.actionItem}
                onPress={() => {
                  onAction(selectedFile, index);
                  onClose();
                }}
              >
                <View style={styles.iconCircle}>
                  <Icon size={20} color={action.color} />
                </View>
                <Text style={styles.iconLabel}>{action.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default ActionModal;

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.12)', // Transparent background
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  overlay: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#bbb',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  fileName: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
  },
  actionItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    fontSize: 11,
    marginTop: 3,
    color: '#333',
  },
});

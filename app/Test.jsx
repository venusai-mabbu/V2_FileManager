import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';

export default function Test() {
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    const listFolders = async () => {
      try {
        const rootDir = FileSystem.documentDirectory;
        console.log("Root Directory:", rootDir);

        const files = await FileSystem.readDirectoryAsync(rootDir);
        setFolders(files);
      } catch (error) {
        console.error("Failed to list directory:", error);
      }
    };

    listFolders();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Document Directory</Text>
      <ScrollView>
        {folders.map((folder, index) => (
          <Text key={index} style={styles.item}>{folder}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, paddingTop: 50, paddingHorizontal: 20,
  },
  title: {
    fontSize: 20, fontWeight: 'bold', marginBottom: 20,
  },
  item: {
    fontSize: 16, paddingVertical: 5, borderBottomWidth: 1, borderColor: '#ccc',
  },
});

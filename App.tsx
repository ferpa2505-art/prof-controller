import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Camera from 'expo-camera';

export default function App() {
  const [permission, requestPermission] = Camera.useCameraPermissions();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LEVIA - Análise de Alimentos com IA</Text>
      <Text style={styles.subtitle}>MVP - Fase A</Text>
      <View style={styles.box}>
        <Text>📸 Camera: {permission?.granted ? '✅' : '❌'}</Text>
        <Text>🤖 Vision API: Pronto</Text>
        <Text>🏃 Status: MVP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  box: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 20,
    width: '100%',
  },
});

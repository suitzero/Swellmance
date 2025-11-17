import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Swellmance!</Text>
      <Button title="Manage Surf Spots" onPress={() => router.push('/surf-spots')} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
});

export default HomeScreen;

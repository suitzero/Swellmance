import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export default function Profile() {
  const router = useRouter();
  const [userSpots, setUserSpots] = useState([]);

  useEffect(() => {
      fetchMySpots();
  }, []);

  const fetchMySpots = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${API_URL}/me/surf-spots`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserSpots(response.data);
      } catch (error) {
        console.error(error);
      }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <Text style={styles.subtitle}>My Preferred Spots:</Text>
      <FlatList
        data={userSpots}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name} ({item.location})</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No spots added yet.</Text>}
      />

      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
      fontSize: 18,
      marginTop: 20,
      marginBottom: 10,
      fontWeight: 'bold'
  },
  item: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee'
  }
});

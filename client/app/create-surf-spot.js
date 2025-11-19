import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:3000';

const createSurfSpot = async ({ name, location }) => {
  const token = await AsyncStorage.getItem('token');
  await axios.post(`${API_URL}/surf-spots`, { name, location }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const CreateSurfSpotScreen = () => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createSurfSpot,
    onSuccess: () => {
      queryClient.invalidateQueries(['surfSpots']);
      router.back();
    },
    onError: () => {
      Alert.alert('Error', 'Could not create surf spot.');
    },
  });

  const handleCreate = () => {
    if (!name || !location) {
      Alert.alert('Error', 'Name and location are required.');
      return;
    }
    mutation.mutate({ name, location });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Surf Spot</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <Button title="Create" onPress={handleCreate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
});

export default CreateSurfSpotScreen;

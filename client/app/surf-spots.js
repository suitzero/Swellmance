import React from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = 'http://localhost:3000';

const fetchSurfSpots = async () => {
  const token = await AsyncStorage.getItem('token');
  const { data } = await axios.get(`${API_URL}/surf-spots`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const addSurfSpot = async (surfSpotId) => {
  const token = await AsyncStorage.getItem('token');
  await axios.post(`${API_URL}/me/surf-spots`, { surfSpotId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const SurfSpotsScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: surfSpots, isLoading, isError } = useQuery({
    queryKey: ['surfSpots'],
    queryFn: fetchSurfSpots,
  });

  const mutation = useMutation({
    mutationFn: addSurfSpot,
    onSuccess: () => {
      Alert.alert('Success', 'Surf spot added to your preferences.');
    },
    onError: () => {
      Alert.alert('Error', 'Could not add surf spot.');
    },
  });

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  if (isError) {
    return <Text>Error fetching surf spots.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Surf Spots</Text>
      <FlatList
        data={surfSpots}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text>{item.name} - {item.location}</Text>
            <Button title="Select" onPress={() => mutation.mutate(item.id)} />
          </View>
        )}
      />
      <Button title="Create New Surf Spot" onPress={() => router.push('/create-surf-spot')} />
      <Button title="Go to Matches" onPress={() => router.push('/matches')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default SurfSpotsScreen;

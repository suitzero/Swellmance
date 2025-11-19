import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import mockApi from '../mocks/api'; // Import the mock API
import SurfSpotCard from '../components/SurfSpotCard';

const fetchSurfSpots = async () => {
  const { data } = await mockApi.getSurfSpots();
  return data;
};

const addSurfSpot = async (surfSpotId) => {
  // In a real app, you'd get the user ID from context or a token
  const userId = 1; // Mock user ID
  await mockApi.addSurfSpot(userId, surfSpotId);
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
    return <ActivityIndicator size="large" style={styles.loading} />;
  }

  if (isError) {
    return <Text style={styles.errorText}>Error fetching surf spots.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Surf Spots</Text>
      <FlatList
        data={surfSpots}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SurfSpotCard spot={item} onSelect={mutation.mutate} />
        )}
      />
      <TouchableOpacity style={styles.button} onPress={() => router.push('/create-surf-spot')}>
        <Text style={styles.buttonText}>Create New Spot</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/matches')}>
        <Text style={styles.buttonText}>View Matches</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#0077b6',
  },
  button: {
    backgroundColor: '#0077b6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: 'red',
  },
});

export default SurfSpotsScreen;

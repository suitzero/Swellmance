import React from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

const API_URL = 'http://localhost:3000';

const fetchMatches = async () => {
  const token = await AsyncStorage.getItem('token');
  const { data } = await axios.get(`${API_URL}/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const MatchesScreen = () => {
  const router = useRouter();

  const { data: matches, isLoading, isError } = useQuery({
    queryKey: ['matches'],
    queryFn: fetchMatches,
  });

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  if (isError) {
    return <Text>Error fetching matches.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text>{item.name}</Text>
          </View>
        )}
      />
      <Button title="Back to Surf Spots" onPress={() => router.back()} />
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
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default MatchesScreen;

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AIMatchmakerScreen() {
  const [story, setStory] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!story.trim()) {
      Alert.alert('Oops', 'Please tell me a bit about yourself and where you like to surf!');
      return;
    }

    setLoading(true);
    setAiResponse(null);

    try {
      const token = await AsyncStorage.getItem('userToken');
      // Using generic localhost for web/iOS/Android simulator
      // Need to adjust for physical devices but localhost is fine for standard testing
      const API_URL = 'http://localhost:3000';

      const response = await axios.post(
        `${API_URL}/ai-matchmaker`,
        { story },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAiResponse(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while talking to the matchmaker. Ensure you are logged in and backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI Surf Matchmaker</Text>
      <Text style={styles.instructions}>
        Tell me a short story about your favorite surfing experiences, the spots you love, and the kind of waves you're looking for. I'll find your perfect match!
      </Text>

      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={6}
        placeholder="e.g. I love hitting the early morning swells at Bondi Beach..."
        value={story}
        onChangeText={setStory}
      />

      <View style={styles.buttonContainer}>
        <Button title="Find My Match" onPress={handleSubmit} disabled={loading} />
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}

      {aiResponse && (
        <View style={styles.responseContainer}>
          <Text style={styles.aiMessageHeader}>Matchmaker says:</Text>
          <Text style={styles.aiMessage}>{aiResponse.message}</Text>

          {aiResponse.matches && aiResponse.matches.length > 0 && (
             <View style={styles.matchesContainer}>
               <Text style={styles.matchesHeader}>Potential Matches:</Text>
               {aiResponse.matches.map((match, index) => (
                 <View key={index} style={styles.matchCard}>
                   <Text style={styles.matchName}>{match.name} ({match.gender})</Text>
                   <Text style={styles.matchSpots}>
                     Likes: {match.preferredSpots.map(s => s.name).join(', ')}
                   </Text>
                 </View>
               ))}
             </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  textInput: {
    width: '100%',
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  responseContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cce0ff',
  },
  aiMessageHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
    color: '#0055a4',
  },
  aiMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  matchesContainer: {
    marginTop: 10,
  },
  matchesHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  matchCard: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  matchName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  matchSpots: {
    fontSize: 14,
    color: '#555',
  }
});

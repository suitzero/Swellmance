import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const API_URL = 'http://localhost:3000';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male'); // Default
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        email,
        password,
        name,
        gender,
      });
      await AsyncStorage.setItem('token', response.data.token);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Swellmance</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {/* Basic gender selection - in a real app, use a proper selector */}
      <View style={styles.genderContainer}>
        <Text>Gender (type &apos;male&apos; or &apos;female&apos; for now):</Text>
        <TextInput
           style={styles.input}
           placeholder="male/female"
           value={gender}
           onChangeText={setGender}
           autoCapitalize="none"
        />
      </View>

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  genderContainer: {
    marginBottom: 10,
  }
});

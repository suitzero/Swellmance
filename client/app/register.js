import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import mockApi from '../mocks/api'; // Import the mock API
import FormInput from '../components/FormInput';
import SubmitButton from '../components/SubmitButton';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !name || !gender) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await mockApi.register({ email, password, name, gender });
      const { token } = response.data;
      await AsyncStorage.setItem('token', token);
      router.replace('/');
    } catch (error) {
      Alert.alert('Registration Failed', 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <FormInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <FormInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <FormInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <FormInput
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0077b6" />
      ) : (
        <SubmitButton title="Register" onPress={handleRegister} />
      )}
      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#0077b6',
  },
  linkText: {
    color: '#0077b6',
    textAlign: 'center',
  },
});

export default RegisterScreen;

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000';

export default function SurfSpots() {
  const [spots, setSpots] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotLocation, setNewSpotLocation] = useState('');

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/surf-spots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpots(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addSpotToProfile = async (spotId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_URL}/me/surf-spots`,
        { surfSpotId: spotId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Added to your preferred spots!');
    } catch (_error) {
      Alert.alert('Error', 'Could not add spot.');
    }
  };

  const createNewSpot = async () => {
    if (!newSpotName || !newSpotLocation) {
        Alert.alert('Error', 'Please fill in name and location');
        return;
    }
    try {
        const token = await AsyncStorage.getItem('token');
        await axios.post(
          `${API_URL}/surf-spots`,
          { name: newSpotName, location: newSpotLocation },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setModalVisible(false);
        setNewSpotName('');
        setNewSpotLocation('');
        fetchSpots(); // Refresh list
        Alert.alert('Success', 'Surf spot created!');
      } catch (_error) {
        Alert.alert('Error', 'Could not create spot.');
      }
  };

  return (
    <View style={styles.container}>
      <Button title="Create New Spot" onPress={() => setModalVisible(true)} />

      <FlatList
        data={spots}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => addSpotToProfile(item.id)}>
            <View style={styles.item}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>{item.location}</Text>
              <Text style={styles.hint}>Tap to add to profile</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
            <View style={styles.modalView}>
                <Text style={styles.modalText}>Add New Surf Spot</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Spot Name"
                    value={newSpotName}
                    onChangeText={setNewSpotName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Location"
                    value={newSpotLocation}
                    onChangeText={setNewSpotLocation}
                />
                <View style={styles.buttonRow}>
                    <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
                    <Button title="Create" onPress={createNewSpot} />
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%'
  },
  input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 10,
      width: '100%',
      paddingHorizontal: 10
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: 'bold'
  },
  buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%'
  }
});

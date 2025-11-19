import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SurfSpotCard = ({ spot, onSelect }) => {
  return (
    <View style={styles.itemContainer}>
      <View>
        <Text style={styles.itemText}>{spot.name}</Text>
        <Text style={styles.itemSubText}>{spot.location}</Text>
      </View>
      <TouchableOpacity style={styles.selectButton} onPress={() => onSelect(spot.id)}>
        <Text style={styles.selectButtonText}>Select</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemSubText: {
    fontSize: 14,
    color: '#666',
  },
  selectButton: {
    backgroundColor: '#0077b6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SurfSpotCard;

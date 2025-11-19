import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const FormInput = (props) => {
  return (
    <TextInput
      style={styles.input}
      placeholderTextColor="#aaa"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderColor: '#0077b6',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
  },
});

export default FormInput;

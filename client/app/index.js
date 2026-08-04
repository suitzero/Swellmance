import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Swellmance!</Text>
      <Text style={styles.subtitle}>Find your perfect surf buddy.</Text>
      <View style={styles.buttonContainer}>
        <Button title="Go to Dashboard" onPress={() => router.push('/home')} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Try AI Matchmaker" onPress={() => router.push('/ai-matchmaker')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 30, color: 'gray' },
  buttonContainer: { marginVertical: 10, width: '100%', maxWidth: 300 }
});

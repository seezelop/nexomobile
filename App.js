import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './styles';  

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenido a Nexo Educativo</Text>
      
      <TouchableOpacity style={styles.button} onPress={() => alert('¡Bienvenido!')}>
        <Text style={styles.buttonText}>Comenzar</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

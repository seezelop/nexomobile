import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import styles from './styles';  // Importamos el archivo de estilos

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenido a Nexo Educativo</Text>
      <StatusBar style="auto" />
    </View>
  );
}
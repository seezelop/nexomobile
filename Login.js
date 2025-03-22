import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';

export default function Login({ navigation }) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Pantalla de Login</Text>
  
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import styles from './styles';  
import GestionarAsistenciaAlumnos from './componentes/pages/GestionarAsistenciaAlumno';
import GestionarAsistenciaProfesor from './componentes/pages/GestionarAsistenteciaProfesor';

// Componente Principal
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={[styles.text, styles.welcomeText]}>Bienvenido a Nexo Educativo</Text>

      
      <TouchableOpacity style={styles.button} onPress={() => alert('¡BienvenidoSKII!')}>
        <Text style={styles.buttonText}>Comenzandooo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('GestionAsistencia')}>
        <Text style={styles.buttonText}>Gestionar Asistencia Alumnos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('GestionAsistenciaProfesor')}>
        <Text style={styles.buttonText}>Gestionar Asistencia Profesores</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

// Configurar el Stack Navigator
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
        <Stack.Screen name="GestionAsistencia" component={GestionarAsistenciaAlumnos} options={{ title: 'Gestión de Asistencia Alumnos' }} />
        <Stack.Screen name="GestionAsistenciaProfesor" component={GestionarAsistenciaProfesor} options={{ title: 'Gestión de Asistencia Profesores' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


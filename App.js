import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import styles from './styles';
import Login from './componentes/pages/Login';
import { UserProvider } from './context/UserContext';  // Importa el contexto
import JefeColegio from './componentes/pages/JefeColegio';
import GestionarAsistenciaAlumnos from './componentes/pages/GestionarAsistenciaAlumnos';
import GestionarAsistenciaProfesor from './componentes/pages/GestionarAsistenciaProfesor';
import ABMEvento from './componentes/pages/ABMEvento';
import AltaComunicacion from './componentes/ABM/AltaComunicacion';
import AltaEvento from './componentes/pages/AltaEvento';
import BajaEvento from './componentes/pages/BajaEvento';
import InformacionCurso from './componentes/pages/InformacionCurso';
import InformacionCursoAlumno from './componentes/pages/InformacionCursoAlumno';
import ModificarEvento from './componentes/pages/ModificarEvento';
import Padre from './componentes/pages/Padre';
import Preceptor from './componentes/pages/Preceptor';
import Profesor from './componentes/pages/Profesor';
import VerNovedades from './componentes/pages/VerNovedades';
import Alumno from './componentes/pages/Alumno';  
import CantInasistenciasAlumno from './componentes/pages/CantInasistenciasAlumno';
import ChatIndividual from './componentes/pages/ChatIndividual';
import Chats from './componentes/pages/Chats';
import CantInasistencias from './componentes/pages/CantInasistencias';

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={[styles.text, styles.welcomeText]}>Bienvenido a Nexo Educativo</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Comenzar</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    // Envolvemos toda la aplicación con el contexto
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="JefeColegio" component={JefeColegio} />
          <Stack.Screen name="GestionarAsistenciaAlumnos" component={GestionarAsistenciaAlumnos} />
          <Stack.Screen name="GestionarAsistenciaProfesor" component={GestionarAsistenciaProfesor} />
          <Stack.Screen name="ABMEvento" component={ABMEvento} />
          <Stack.Screen name="AltaComunicacion" component={AltaComunicacion} />
          <Stack.Screen name="AltaEvento" component={AltaEvento} />
          <Stack.Screen name="Alumno" component={Alumno} />
          <Stack.Screen name="BajaEvento" component={BajaEvento} />
          <Stack.Screen name="CantInasistenciasAlumno" component={CantInasistenciasAlumno} />
          <Stack.Screen name="InformacionCurso" component={InformacionCurso} />
          <Stack.Screen name="InformacionCursoAlumno" component={InformacionCursoAlumno} />
          <Stack.Screen name="ModificarEvento" component={ModificarEvento} />
          <Stack.Screen name="Padre" component={Padre} />
          <Stack.Screen name="Preceptor" component={Preceptor} />
          <Stack.Screen name="Profesor" component={Profesor} />
          <Stack.Screen name="VerNovedades" component={VerNovedades} />
          <Stack.Screen name="ChatIndividual" component={ChatIndividual} />
          <Stack.Screen name="Chats" component={Chats} />
          <Stack.Screen name="CantInasistencias" component={CantInasistencias} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

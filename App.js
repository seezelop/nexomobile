import React, { useState } from 'react';  // Importamos useState
import { StatusBar } from 'expo-status-bar';
import { Text, View, Button } from 'react-native';
import styles from './styles';  // Importamos el archivo de estilos
import GestionarAsistenciaAlumnos from './componentes/pages/GestionarAsistenciaAlumno';

export default function App() {
  // Creamos un estado para controlar si el componente 'GestionarAsistenciaAlumnos' debe mostrarse
  const [showGestionarAsistencia, setShowGestionarAsistencia] = useState(false);

  // Función que manejará el clic del botón
  const handleButtonPress = () => {
    setShowGestionarAsistencia(true);  // Cambiamos el estado para mostrar el componente
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenido a Nexo Educativo</Text>
      
      {/* Aquí agregamos el botón */}
      <Button
        title="Gestionar Asistencia Alumnos"
        onPress={handleButtonPress} // Se ejecuta cuando el botón es presionado
      />

      {/* Renderizamos el componente 'GestionarAsistenciaAlumnos' si el estado 'showGestionarAsistencia' es true */}
      {showGestionarAsistencia && <GestionarAsistenciaAlumnos />}

      <StatusBar style="auto" />
    </View>
  );
}

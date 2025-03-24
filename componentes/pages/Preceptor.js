import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native'

function Preceptor() {
  const navigation = useNavigation();  // Hook para redirigir a otra pantalla

  const redirigirAlumno = () => {
    navigation.navigate('GestionarAsistenciaAlumnos');  // Redirige a la pantalla de seleccionar curso
  };

  const redirigirProfesor = () => {
    navigation.navigate('GestionarAsistenciaProfesor');  // Redirige a la pantalla de seleccionar curso
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido Preceptor</Text>

      <Button
        title="Gestionar Asistencia de Alumnos"
        onPress={redirigirAlumno}
        color="#007bff"
      />

      <Button
        title="Gestionar Asistencia de Profesores"
        onPress={redirigirProfesor}
        color="#007bff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20, // Espacio entre el título y los botones
  },
  buttonContainer: {
    marginVertical: 10, // Espacio entre los botones
    width: '100%',
  },
});

export default Preceptor;

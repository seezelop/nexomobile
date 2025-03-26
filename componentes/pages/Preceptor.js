import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';

function Preceptor({ navigation }) {
  //const navigation = useNavigation();

  const redirigirAlumno = () => {
    navigation.navigate('GestionarAsistenciaAlumnos');
  };

  const redirigirProfesor = () => {
    navigation.navigate('GestionarAsistenciaProfesor');
  };

  const redirigirChat = () => {
    navigation.navigate('Chats');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido Preceptor</Text>

      <View style={styles.buttonContainer}>
        <Button title="Gestionar Asistencia de Alumnos" onPress={redirigirAlumno} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Gestionar Asistencia de Profesores" onPress={redirigirProfesor} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Chats" onPress={redirigirChat} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
});

export default Preceptor;


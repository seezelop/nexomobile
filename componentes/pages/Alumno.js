import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

function Alumno({ navigation }) {
  const irANovedades = () => {
    navigation.navigate('VerNovedades');
  };

  const irAInformacionCurso = () => {
    navigation.navigate('InformacionCursoAlumno');
  };

  const irAInasistencias = () => {
    navigation.navigate('CantInasistenciasAlumno');
  };

  const redirigirChat = () => {
    navigation.navigate('Chats');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido Alumno</Text>

      <View style={styles.buttonContainer}>
        <Button title="Novedades" onPress={irANovedades} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Información del Curso" onPress={irAInformacionCurso} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Cantidad de Faltas" onPress={irAInasistencias} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Enviar Mensaje Privado" onPress={redirigirChat} />
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

export default Alumno;

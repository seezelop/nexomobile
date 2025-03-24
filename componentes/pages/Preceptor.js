import React from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';

function Preceptor() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenido Preceptor</Text>

        {/* Botón para gestionar asistencia de alumnos */}
        <View style={styles.buttonContainer}>
          <Button title="Gestionar Asistencia Alumnos" onPress={() => { /* Lógica de navegación o acción */ }} />
        </View>

        {/* Botón para gestionar asistencia de profesores */}
        <View style={styles.buttonContainer}>
          <Button title="Gestionar Asistencia Profesores" onPress={() => { /* Lógica de navegación o acción */ }} />
        </View>
      </View>
    </ScrollView>
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

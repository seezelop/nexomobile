import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Profesor() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido Profesor</Text>
      <Text style={styles.subtitle}>
        Accede a los materiales educativos, asigna calificaciones y gestiona actividades de los alumnos.
      </Text>
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
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Profesor;

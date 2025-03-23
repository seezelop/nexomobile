import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';  // Usamos el hook useNavigation para la navegación en React Native

const JefeColegio = () => {
  const navigation = useNavigation();  // Hook para redirigir a otra pantalla

  const redirigirASeleccionarCurso = () => {
    navigation.navigate('SeleccionarCurso');  // Redirige a la pantalla de seleccionar curso
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido Jefe de Colegio</Text>
      
      <Button
        title="Seleccionar Curso"
        onPress={redirigirASeleccionarCurso}  // Acción del botón para redirigir
        color="#007bff"  // Cambia el color del botón
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: "center",
  },
});

export default JefeColegio;

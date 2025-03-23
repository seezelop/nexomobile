import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Para la navegación

const PreceptorNavigation = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Chats")}
      >
        <Text style={styles.navText}>Chats</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("ABMCursoPreceptor")}
      >
        <Text style={styles.navText}>ABM Curso</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("GestionarAsistenciaAlumno")}
      >
        <Text style={styles.navText}>Asistencia alumno</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("GestionarAsistenciaProfesor")}
      >
        <Text style={styles.navText}>Asistencia profesor</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Preceptor")}
      >
        <Text style={styles.navText}>Mi perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  navItem: {
    paddingVertical: 10,
  },
  navText: {
    fontSize: 18,
    color: "blue", // Puedes personalizar este color
  },
});

export default PreceptorNavigation;

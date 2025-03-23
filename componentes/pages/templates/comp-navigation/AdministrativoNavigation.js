import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Para la navegación

const AdministrativoNavigation = () => {
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
        onPress={() => navigation.navigate("ABMMaterias")}
      >
        <Text style={styles.navText}>ABM materias</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("ABMProfesor")}
      >
        <Text style={styles.navText}>ABM profesor</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("ABMPadre")}
      >
        <Text style={styles.navText}>ABM padre</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("ABMAlumno")}
      >
        <Text style={styles.navText}>ABM alumno</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("ABMCurso")}
      >
        <Text style={styles.navText}>ABM curso</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("ABMPreceptor")}
      >
        <Text style={styles.navText}>ABM preceptor</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("MiPerfil")}
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

export default AdministrativoNavigation;

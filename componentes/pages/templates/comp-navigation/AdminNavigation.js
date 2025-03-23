import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Para la navegación

const AdminNavigation = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("ABMEscuelas")}
      >
        <Text style={styles.navText}>ABM escuelas</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("ABMJefeColegio")}
      >
        <Text style={styles.navText}>ABM Jefe Colegio</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("MiPerfil")}
      >
        <Text style={styles.navText}>Mi Perfil</Text>
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

export default AdminNavigation;

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Para la navegación

const PadreNavigation = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("InformacionCurso")}
      >
        <Text style={styles.navText}>Información del curso</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Chats")}
      >
        <Text style={styles.navText}>Chats</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("InfoPago")}
      >
        <Text style={styles.navText}>Información de pago</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("CantInasistencias")}
      >
        <Text style={styles.navText}>Cantidad de faltas</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("RealizarPago")}
      >
        <Text style={styles.navText}>Pagar cuota</Text>
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

export default PadreNavigation;

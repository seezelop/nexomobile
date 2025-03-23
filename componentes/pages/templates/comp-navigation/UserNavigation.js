import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Para la navegación

const UserNavigation = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("QueOfrecemos")}
      >
        <Text style={styles.navText}>¿Qué ofrecemos?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("PreguntasFrecuentes")}
      >
        <Text style={styles.navText}>Preguntas Frecuentes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("SobreNosotros")}
      >
        <Text style={styles.navText}>Sobre nosotros</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Contacto")}
      >
        <Text style={styles.navText}>Contacto</Text>
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

export default UserNavigation;

import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { UserContext } from "../../context/UserContext"; // Contexto del usuario
import { useNavigation } from "@react-navigation/native"; // Para navegación
import { Button } from "react-native-paper"; // Para un estilo más acorde con React Native

const Header = () => {
  const { userRole, infoSesion, setUserRole, setInfoSesion } = useContext(UserContext); // Accede al contexto
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      // Opcional: Llama a una API para cerrar sesión en el backend
      await axios.post("http://localhost:8080/logout", {}, { withCredentials: true });

      // Limpia el contexto del usuario
      setUserRole(null);
      setInfoSesion(null);

      // Redirige a la página de inicio de sesión
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "Hubo un problema al cerrar sesión");
    }
  };

  const renderNavigation = () => {
    switch (userRole) {
      case "super admin":
        return <AdminNavigation />;
      case "jefe colegio":
        return <JefeColegioNavigation />;
      case "administrativo":
        return <AdministrativoNavigation />;
      case "preceptor":
        return <PreceptorNavigation />;
      case "profesor":
        return <ProfesorNavigation />;
      case "padre":
        return <PadreNavigation />;
      case "alumno":
        return <AlumnoNavigation />;
      default:
        return <UserNavigation />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Enlace al inicio */}
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Text style={styles.homeLink}>Inicio</Text>
      </TouchableOpacity>

      {/* Opciones de navegación */}
      <View style={styles.navContainer}>{renderNavigation()}</View>

      {/* Información de usuario y cierre de sesión */}
      <View style={styles.userContainer}>
        {infoSesion ? (
          <>
            {/* Muestra el nombre del usuario */}
            <Text style={styles.welcomeText}>Hola, {infoSesion}</Text>
            {/* Botón de cierre de sesión */}
            <Button mode="outlined" onPress={handleLogout}>
              Cerrar sesión
            </Button>
          </>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginText}>Iniciar sesión</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#333",
    alignItems: "center",
  },
  homeLink: {
    color: "#fff",
    fontSize: 18,
  },
  navContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userContainer: {
    marginLeft: "auto",
    alignItems: "center",
  },
  welcomeText: {
    color: "#fff",
    fontSize: 16,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Header;

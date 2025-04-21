import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Alert 
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from '../../url';

const Chats = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axiosInstance.get('/chatIndividual', {
          withCredentials: true,
        });

        if (Array.isArray(response.data)) {
          setUsuarios(response.data);
        } else {
          setError("Datos de usuarios no válidos");
        }
      } catch (error) {
        setError("Error al obtener usuarios");
        console.error("Error al obtener usuarios:", error);
      }
    };

    fetchUsuarios();
  }, []);

  const iniciarChat = (usuario) => {
    navigation.navigate('ChatIndividual', { mail: usuario.mail });
  };

  const renderUsuario = ({ item: usuario }) => (
    <View style={styles.usuarioItem}>
      <View style={styles.usuarioInfo}>
        <Text style={styles.usuarioNombre}>
          {usuario.nombre} {usuario.apellido}
        </Text>
        <Text style={styles.usuarioMail}>{usuario.mail}</Text>
      </View>
      <TouchableOpacity 
        style={styles.botonChatear}
        onPress={() => iniciarChat(usuario)}
      >
        <Text style={styles.botonChatearTexto}>Chatear</Text>
      </TouchableOpacity>
    </View>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorTexto}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTexto}>Selecciona un Usuario para Chatear</Text>
      </View>

      {usuarios.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTexto}>No hay usuarios disponibles.</Text>
        </View>
      ) : (
        <FlatList
          data={usuarios}
          renderItem={renderUsuario}
          keyExtractor={(usuario) => usuario.mail}
          contentContainerStyle={styles.listaContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#2575fc',
    alignItems: 'center',
  },
  headerTexto: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listaContainer: {
    padding: 10,
  },
  usuarioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  usuarioInfo: {
    flex: 1,
    marginRight: 10,
  },
  usuarioNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  usuarioMail: {
    fontSize: 14,
    color: '#666',
  },
  botonChatear: {
    backgroundColor: '#2575fc',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  botonChatearTexto: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
  },
  errorTexto: {
    color: '#721c24',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTexto: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default Chats;
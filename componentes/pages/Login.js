import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { UserContext } from '../../context/UserContext';  // Importa el contexto
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../url';

export default function Login({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Añadido estado de error
  const { setUserRole, setInfoSesion } = useContext(UserContext);

  // Configura axios con opciones por defecto
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  });

  const handleSubmit = async () => {
    try {
      // Envía las credenciales usando axios en lugar de fetch
      const loginResponse = await axiosInstance.post('/login', 
        new URLSearchParams({
          username: username,
          password: password
        }),
        {
          // Configura explícitamente las credenciales
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          withCredentials: true
        }
      );

      // Verifica la respuesta
      if (loginResponse.status === 200) {
        // Obtiene el rol del usuario
        const roleResponse = await axiosInstance.get('/api/usuario/getRolUsuarioLogueado');
        const userRole = roleResponse.data.split(': ')[1];

        // Obtiene información de la sesión
        const infoResponse = await axiosInstance.get('/auth/info');
        
        // Guarda la información en el contexto
        setUserRole(userRole);
        setInfoSesion(infoResponse.data);

        // Guarda el rol en AsyncStorage
        await AsyncStorage.setItem('userRole', userRole);

        // Navega según el rol
        switch (userRole.toLowerCase()) {
          case 'super admin':
            navigation.navigate('Admin');
            break;
          case 'jefe colegio':
            navigation.navigate('JefeColegio');
            break;
            case 'preceptor':
              navigation.navigate('Preceptor');
              break;
            case 'profesor':
              navigation.navigate('Profesor')
          
        }
      }
    } catch (error) {
      console.error('Login Error:', error);
      
      // Manejo de errores más detallado
      if (error.response) {
        // El servidor respondió con un estado de error
        switch (error.response.status) {
          case 401:
            Alert.alert('Error', 'Credenciales inválidas');
            break;
          case 403:
            Alert.alert('Error', 'Acceso prohibido');
            break;
          case 500:
            Alert.alert('Error', 'Error interno del servidor');
            break;
          default:
            Alert.alert('Error', 'Error de autenticación');
        }
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        Alert.alert('Error', 'Sin respuesta del servidor');
      } else {
        // Algo sucedió al configurar la solicitud
        Alert.alert('Error', 'Error al configurar la solicitud');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su correo"
        value={username}
        onChangeText={setUsername}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6360AE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#000',
  },
  button: {
    backgroundColor: '#AE4390',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  backButton: {
    marginTop: 20,
  },
});

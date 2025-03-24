import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { UserContext } from '../../context/UserContext';  // Importa el contexto
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUserRole: saveUserRole, setInfoSesion } = useContext(UserContext);  // Accede al contexto y usa saveUserRole

  const handleSubmit = async () => {
    try {
      const loginResponse = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
        credentials: "include",
      });

      if (loginResponse.ok) {
        // Obtener el rol del usuario
        const roleResponse = await axios.get('http://localhost:8080/api/usuario/getRolUsuarioLogueado', { withCredentials: true });
        const userRole = roleResponse.data.split(': ')[1];  // Obtener el rol
        saveUserRole(userRole);  // Usa saveUserRole

        // Obtener más información del usuario
        const infoResponse = await axios.get('http://localhost:8080/auth/info', { withCredentials: true });
        setInfoSesion(infoResponse.data);

        // Guardar el rol en AsyncStorage
        await AsyncStorage.setItem('rol', userRole);

        // Redireccionar según el rol del usuario
        // Redireccionar según el rol del usuario
        switch (userRole.toLowerCase()) {
          case 'super admin':
            navigation.navigate('Admin');
            break;
          case 'jefe colegio':  // Si el rol es "jefe colegio", navega a la pantalla
            navigation.navigate('JefeColegio');
            break;
          case 'administrativo':
            navigation.navigate('Administrativo');
            break;
          case 'preceptor':
            navigation.navigate('Preceptor');
            break;
          case 'profesor':
            navigation.navigate('Profesor');
            break;
          case 'padre':
            navigation.navigate('Padre');
            break;
          case 'alumno':
            navigation.navigate('Alumno');
            break;
          default:
            setError('Rol no reconocido');
        }

      } else {
        setError('Credenciales incorrectas');
      }
    } catch (e) {
      console.error("Error en la solicitud", e);
      setError('Error al conectar con el servidor');
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

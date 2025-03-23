import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import styles from './styles';

export default function Login({ navigation }) {
  // Estados para manejar los valores del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Función para manejar el envío del formulario
  const handleSubmit = () => {
    console.log('Correo electrónico:', email);
    console.log('Contraseña:', password);

    // Aquí va la lógica para validar o enviar los datos al servidor
  };

  return (
    <View style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>Ingresá tus datos para poder acceder</Text>

      {/* Campo de Correo Electrónico */}
      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Campo de Contraseña */}
      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Botón de Inicio de Sesión */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>

      {/* Botón de Volver */}
      <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
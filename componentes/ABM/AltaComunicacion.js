import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_BASE_URL } from '../url';
 

function AltaComunicacion() {
  const [mensaje, setMensaje] = useState('');
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [respuesta, setRespuesta] = useState('');

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });
  // Cargar cursos desde el backend
  useEffect(() => {
    const cargarCursos = async () => {
      try {
        const response = await axiosInstance.get('/api/usuario/verCursoProfesor', {
          withCredentials: true,
        });
        setCursos(response.data);
      } catch (error) {
        console.error("Error al cargar los cursos:", error);
      }
    };

    cargarCursos();
  }, []);

  // Manejo del envío
  const manejarEnvio = async () => {
    if (!cursoSeleccionado) {
      setRespuesta('Selecciona un curso antes de enviar el mensaje.');
      return;
    }

    try {
      await axiosInstance.post(`/novedades/${cursoSeleccionado}`, { contenido: mensaje }, { withCredentials: true });
      setRespuesta('Mensaje enviado exitosamente.');
      setMensaje('');
      setCursoSeleccionado('');
    } catch (error) {
      setRespuesta('Error al enviar el mensaje.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Enviar Comunicación</Text>

        {/* Selección de curso */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Seleccionar Curso</Text>
          <Picker
            selectedValue={cursoSeleccionado}
            onValueChange={(itemValue) => setCursoSeleccionado(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un curso" value="" />
            {cursos.map((curso) => (
              <Picker.Item key={curso.idCurso} label={`${curso.numero}${curso.division}`} value={curso.idCurso} />
            ))}
          </Picker>
        </View>

        {/* Mensaje */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mensaje</Text>
          <TextInput
            style={styles.textArea}
            value={mensaje}
            onChangeText={setMensaje}
            multiline
            numberOfLines={3}
            placeholder="Escribe tu mensaje aquí"
          />
        </View>

        {/* Enviar Button */}
        <Button title="Enviar Comunicación" onPress={manejarEnvio} />

        {/* Mensaje de respuesta */}
        {respuesta && (
          <View style={styles.alertContainer}>
            <Text style={styles.alertText}>{respuesta}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  textArea: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
  },
  alertContainer: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
  },
  alertText: {
    color: '#00796b',
    textAlign: 'center',
  },
});

export default AltaComunicacion;

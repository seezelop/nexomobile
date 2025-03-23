import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, TextInput, Button, Picker, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

function AltaEvento() {
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [respuesta, setRespuesta] = useState('');

  // Cargar cursos al montar el componente
  useEffect(() => {
    cargarCursos();
  }, []);

  // Función para cargar los cursos del profesor
  const cargarCursos = async () => {
    setCargando(true);
    try {
      const response = await axios.get('http://localhost:8080/api/usuario/verCursoProfesor', {
        withCredentials: true,
      });
      setCursos(response.data);
      setCargando(false);
    } catch (error) {
      console.error('Error al cargar los cursos:', error);
      setCargando(false);
      Alert.alert('Error', 'Error al cargar los cursos. Por favor, intente nuevamente.');
    }
  };

  // Formatear la fecha para el backend
  const formatDateForBackend = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  // Manejo del envío
  const manejarEnvio = async () => {
    const fechaObj = formatDateForBackend(fecha);
    try {
      await axios.post(`http://localhost:8080/api/usuario/altaEvento/${cursoSeleccionado}`, {
        cursoSeleccionado,
        descripcion,
        fecha: fechaObj,
      }, { withCredentials: true });

      setRespuesta('Evento creado exitosamente.');
      setDescripcion('');
      setFecha(new Date());
      setCursoSeleccionado('');
    } catch (error) {
      setRespuesta('Error al crear el evento.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Evento</Text>

      {/* Selección de Curso */}
      <Text>Seleccionar Curso</Text>
      <Picker
        selectedValue={cursoSeleccionado}
        onValueChange={(itemValue) => setCursoSeleccionado(itemValue)}
        enabled={!cargando}
      >
        <Picker.Item label="Seleccione un curso" value="" />
        {cursos.map((curso) => (
          <Picker.Item key={curso.idCurso} label={`${curso.numero} ${curso.division}`} value={curso.idCurso} />
        ))}
      </Picker>

      {/* Descripción */}
      <Text>Descripción</Text>
      <TextInput
        style={styles.input}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={4}
        placeholder="Descripción del evento"
      />

      {/* Fecha */}
      <Text>Fecha</Text>
      <DateTimePicker
        value={fecha}
        mode="datetime"
        display="default"
        onChange={(event, selectedDate) => setFecha(selectedDate || fecha)}
      />

      {/* Botón para enviar */}
      <Button title="Crear Evento" onPress={manejarEnvio} />

      {/* Respuesta */}
      {respuesta && <Text style={styles.response}>{respuesta}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  response: {
    marginTop: 20,
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
  },
});

export default AltaEvento;

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

function ModificarEvento() {
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/usuario/verCursoProfesor', {
        withCredentials: true,
      });
      setCursos(response.data);
    } catch (error) {
      console.error('Error al cargar los cursos:', error);
    }
  };

  const cargarEventos = async (cursoId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/usuario/verEventos/${cursoId}`, {
        withCredentials: true,
      });
      setEventos(response.data);
    } catch (error) {
      console.error('Error al cargar los eventos:', error);
    }
  };

  const handleCursoChange = (cursoId) => {
    if (cursoId) {
      cargarEventos(cursoId);
    } else {
      setEventos([]);
    }
    setCursoSeleccionado(cursoId);
  };

  // Helper function to ensure date is in ISO format
  const formatDateForBackend = (dateString) => {
    if (!dateString) return undefined;

    if (dateString.includes('T')) {
      return dateString;
    }

    try {
      if (dateString.match(/^\d{2}-\d{2}-\d{4}\s\d{2}:\d{2}$/)) {
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('-');
        const [hour, minute] = timePart.split(':');

        return `${year}-${month}-${day}T${hour}:${minute}`;
      }

      return dateString;
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  const manejarEnvio = async () => {
    const formattedFecha = formatDateForBackend(fecha);
    const eventoData = {
      idEvento: parseInt(eventoSeleccionado),
      descripcion: descripcion || undefined,
      fecha: formattedFecha,
    };

    Object.keys(eventoData).forEach(
      (key) => eventoData[key] === undefined && delete eventoData[key]
    );

    try {
      const response = await axios.patch(
        'http://localhost:8080/api/usuario/modificarEvento',
        eventoData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setRespuesta('Evento editado exitosamente.');
      setDescripcion('');
      setFecha('');
      setEventoSeleccionado('');

      if (cursoSeleccionado) {
        cargarEventos(cursoSeleccionado);
      }
    } catch (error) {
      console.error('Error completo:', error);
      if (error.response && error.response.data) {
        const mensajeError = typeof error.response.data === 'string'
          ? error.response.data
          : error.response.data.message;
        setRespuesta(mensajeError || 'Error desconocido al editar el evento.');
      } else {
        setRespuesta('Error al conectar con el servidor. Verifique el formato de fecha (YYYY-MM-DDTHH:MM).');
      }
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Seleccionar Curso:</Text>
      <Picker
        selectedValue={cursoSeleccionado}
        onValueChange={handleCursoChange}
      >
        <Picker.Item label="Seleccione un curso" value="" />
        {cursos.map((curso) => (
          <Picker.Item key={curso.idCurso} label={`${curso.numero} ${curso.division}`} value={curso.idCurso} />
        ))}
      </Picker>

      <Text>Seleccionar Evento:</Text>
      <Picker
        selectedValue={eventoSeleccionado}
        onValueChange={(itemValue) => setEventoSeleccionado(itemValue)}
        enabled={cursoSeleccionado !== ''}
      >
        <Picker.Item label="Seleccione un evento" value="" />
        {eventos.map((evento) => (
          <Picker.Item key={evento.idEvento} label={evento.descripcion} value={evento.idEvento} />
        ))}
      </Picker>

      <Text>Descripción:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Deje en blanco para mantener la descripción actual"
      />

      <Text>Fecha:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={fecha}
        onChangeText={setFecha}
        placeholder="Deje en blanco para mantener la fecha actual"
      />

      <Button title="Modificar Evento" onPress={manejarEnvio} />

      {respuesta && (
        <Text style={{ marginTop: 20, color: 'green' }}>{respuesta}</Text>
      )}
    </View>
  );
}

export default ModificarEvento;

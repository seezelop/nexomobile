import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, Button, Alert, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { API_BASE_URL } from '../../url';

function BajaEvento() {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');

  useEffect(() => {
    cargarCursos();
  }, []);

  useEffect(() => {
    if (cursoSeleccionado) {
      cargarEventos(cursoSeleccionado);
    } else {
      setEventos([]);
      setEventoSeleccionado('');
    }
  }, [cursoSeleccionado]);

  const cargarCursos = async () => {
    setCargando(true);
    setMensaje('');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/usuario/verCursoProfesor`, {
        withCredentials: true
      });
      setCursos(response.data);
      setCargando(false);
    } catch (error) {
      console.error('Error al cargar los cursos:', error);
      setMensaje('Error al cargar los cursos. Por favor, intente nuevamente.');
      setTipoMensaje('danger');
      setCargando(false);
    }
  };

  const cargarEventos = async (idCurso) => {
    setCargando(true);
    setMensaje('');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/usuario/verEventos/${idCurso}`, {
        withCredentials: true
      });
      setEventos(response.data);
      setCargando(false);
    } catch (error) {
      console.error('Error al cargar los eventos:', error);
      setMensaje('Error al cargar los eventos. Por favor, intente nuevamente.');
      setTipoMensaje('danger');
      setCargando(false);
    }
  };

  const eliminarEvento = () => {
    if (!eventoSeleccionado) {
      Alert.alert('Error', 'Por favor, seleccione un evento para eliminar.');
      return;
    }
  
    Alert.alert(
      'Confirmar Eliminación', 
      '¿Está seguro que desea eliminar el evento? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setCargando(true);
              
              const deleteUrl = `${API_BASE_URL}/api/usuario/borrarEvento/${eventoSeleccionado}`;
              console.log('Delete URL:', deleteUrl);
  
              const response = await axios.delete(deleteUrl, {
                withCredentials: true
              });
  
              console.log('Delete response:', response.data);
  
              await cargarEventos(cursoSeleccionado);
  
              setEventoSeleccionado('');
              Alert.alert('Éxito', 'El evento ha sido eliminado con éxito.');
              setCargando(false);
            } catch (error) {
              console.error('Error al eliminar el evento:', error);
              console.error('Error response:', error.response?.data);
              console.error('Error status:', error.response?.status);
  
              let mensajeError = 'Error al eliminar el evento. Por favor, intente nuevamente.';
              if (error.response && error.response.data) {
                mensajeError = `Error: ${error.response.data.mensaje || JSON.stringify(error.response.data)}`;
              }
  
              Alert.alert('Error', mensajeError);
              setCargando(false);
            }
          }
        }
      ]
    );
  };

  const handleSubmit = () => {
    eliminarEvento();
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
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

        {cursoSeleccionado && (
          <View style={styles.eventosContainer}>
            <Text>Seleccionar Evento</Text>
            {eventos.length > 0 ? (
              <FlatList
                data={eventos}
                keyExtractor={(item) => item.idEvento.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.eventoItem,
                      eventoSeleccionado === item.idEvento.toString() ? styles.selectedEvento : null,
                    ]}
                    onPress={() => setEventoSeleccionado(item.idEvento.toString())}
                    disabled={cargando}
                  >
                    <Text style={styles.eventoText}>
                      {item.descripcion && item.descripcion.trim() !== '' ? item.descripcion : 'Evento sin nombre'}
                    </Text>
                    <Text style={styles.fechaText}>{item.fecha}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text>No hay eventos disponibles para este curso.</Text>
            )}
          </View>
        )}

        <Button
          title={cargando ? 'Procesando...' : 'Eliminar Evento'}
          onPress={handleSubmit}
          disabled={cargando || !eventoSeleccionado}
        />
      </View>

      {cargando && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  form: {
    marginTop: 20,
  },
  eventosContainer: {
    marginTop: 20,
  },
  eventoItem: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedEvento: {
    backgroundColor: '#ddd',
  },
  eventoText: {
    fontSize: 16,
    color: 'black',
  },
  fechaText: {
    fontSize: 12,
    color: 'gray',
  },
})

export default BajaEvento;

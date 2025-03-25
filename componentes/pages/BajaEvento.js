import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

function BajaEvento() {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');

  // Cargar cursos al montar el componente
  useEffect(() => {
    cargarCursos();
  }, []);

  // Cargar eventos cuando se selecciona un curso
  useEffect(() => {
    if (cursoSeleccionado) {
      cargarEventos(cursoSeleccionado);
    } else {
      setEventos([]);
      setEventoSeleccionado('');
    }
  }, [cursoSeleccionado]);

  // Función para cargar los cursos del profesor
  const cargarCursos = async () => {
    setCargando(true);
    setMensaje('');

    try {
      const response = await axios.get('http://localhost:8080/api/usuario/verCursoProfesor', {
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

  // Función para cargar los eventos de un curso
  const cargarEventos = async (idCurso) => {
    setCargando(true);
    setMensaje('');

    try {
      const response = await axios.get(`http://localhost:8080/api/usuario/verEventos/${idCurso}`, {
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

  // Manejar eliminación de evento
  const eliminarEvento = async () => {
    if (!eventoSeleccionado) {
      setMensaje('Por favor, seleccione un evento para eliminar.');
      setTipoMensaje('warning');
      return;
    }

    const eventoAEliminar = eventos.find(evento => evento.idEvento.toString() === eventoSeleccionado.toString());
    const nombreEvento = eventoAEliminar ? eventoAEliminar.nombre || `ID: ${eventoSeleccionado}` : `ID: ${eventoSeleccionado}`;

    const confirmar = window.confirm(`¿Está seguro que desea eliminar el evento? Esta acción no se puede deshacer.`);

    if (confirmar) {
      setCargando(true);
      setMensaje('');

      try {
        await axios.delete(`http://localhost:8080/api/usuario/borrarEvento/${eventoSeleccionado}`, {
          withCredentials: true
        });

        // Recargar eventos después de eliminar
        await cargarEventos(cursoSeleccionado);

        setEventoSeleccionado('');
        setMensaje(`El evento ha sido eliminado con éxito.`);
        setTipoMensaje('success');
        setCargando(false);
      } catch (error) {
        console.error('Error al eliminar el evento:', error);

        let mensajeError = 'Error al eliminar el evento. Por favor, intente nuevamente.';
        if (error.response && error.response.data) {
          mensajeError = `Error: ${error.response.data.mensaje || JSON.stringify(error.response.data)}`;
        }

        setMensaje(mensajeError);
        setTipoMensaje('danger');
        setCargando(false);
      }
    }
  };

  // Manejo del formulario
  const handleSubmit = () => {
    eliminarEvento();
  };

  return (
    <View style={styles.container}>
      {mensaje && (
        <Alert variant={tipoMensaje} onClose={() => setMensaje('')} dismissible>
          {mensaje}
        </Alert>
      )}

      <View style={styles.form}>
        {/* Selector de Curso */}
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

        {/* Lista de Eventos */}
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

        {/* Botón de eliminar */}
        <Button
          title={cargando ? 'Procesando...' : 'Eliminar Evento'}
          onPress={handleSubmit}
          disabled={cargando || !eventoSeleccionado}
        />
      </View>

      {cargando && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
}

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
});

export default BajaEvento;

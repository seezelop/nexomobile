import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Checkbox, Button, Provider as PaperProvider } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_BASE_URL } from '../url';

const GestionarAsistenciaAlumnos = () => {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
  const [asistencia, setAsistencia] = useState([]);
  const [fechasAsistencias, setFechasAsistencias] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [idAsistenciaSeleccionada, setIdAsistenciaSeleccionada] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchCursos();
  }, []);

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const fetchCursos = async () => {
    try {
      const response = await axiosInstance.get('api/usuario/verCursoPreceptor');
      setCursos(response.data);
    } catch (error) {
      console.error('Error al obtener cursos:', error);
      setMensaje({ text: 'Hubo un error al cargar los cursos.', type: 'danger' });
    }
  };

  const fetchAlumnos = async (cursoId) => {
    if (!cursoId) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`api/usuario/verAlumnosCurso/${cursoId}`);
      const alumnosData = response.data;

      const asistenciaInicial = alumnosData.map(alumno => ({
        idUsuario: alumno.id_usuario,
        asistio: 0,
        mediaFalta: 0,
        retiroAntes: 0,
      }));

      setAlumnos(alumnosData);
      setAsistencia(asistenciaInicial);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFechasAsistencias = async (cursoId) => {
    if (!cursoId) return;

    try {
      const response = await axiosInstance.get(`api/usuario/obtenerAsistencias/${cursoId}`);
      setFechasAsistencias(response.data);
    } catch (error) {
      console.error('Error al obtener fechas de asistencias:', error);
      setMensaje({ text: 'Hubo un error al cargar las fechas de asistencias.', type: 'danger' });
    }
  };

  const handleCursoChange = (itemValue) => {
    setCursoSeleccionado(itemValue);
    if (itemValue) {
      fetchAlumnos(itemValue);
    } else {
      setAlumnos([]);
      setAsistencia([]);
    }
  };

  const handleAlumnoChange = (itemValue) => {
    setAlumnoSeleccionado(itemValue);
  };

  const handleFechaChange = (itemValue) => {
    setIdAsistenciaSeleccionada(itemValue);
    const asistenciaSeleccionada = fechasAsistencias.find(a => a.idAsistencia === parseInt(itemValue));
    if (asistenciaSeleccionada) {
      setFechaSeleccionada(asistenciaSeleccionada.fecha);
    } else {
      setFechaSeleccionada('');
    }
  };

  const handleAsistenciaChange = (index, field) => {
    const updatedAsistencia = [...asistencia];
    
    // Reset all values first
    updatedAsistencia[index] = {
      ...updatedAsistencia[index],
      asistio: 0,
      mediaFalta: 0,
      retiroAntes: 0,
    };
    
    // Then set the selected field to 1
    updatedAsistencia[index][field] = 1;
    
    setAsistencia(updatedAsistencia);
  };

  const handleSubmit = async () => {
    if (!cursoSeleccionado) {
      setMensaje({ text: 'Debe seleccionar un curso.', type: 'warning' });
      return;
    }

    if (asistencia.length === 0) {
      setMensaje({ text: 'No hay alumnos para registrar asistencia.', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        alumnosCurso: asistencia,
      };

      console.log("LO QUE SE VA A ENVIAR: "+JSON.stringify(dataToSend))
      const response = await axiosInstance.post(
        `api/usuario/tomarAsistencia/${cursoSeleccionado}`,
        dataToSend,
        { withCredentials: true }
      );

      if (response.status === 201) {
        setMensaje({ text: 'Asistencia registrada correctamente.', type: 'success' });
      }
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      setMensaje({
        text: `Error al registrar la asistencia: ${error.response?.data || error.message}`,
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.titulo}>Tomar Asistencia</Text>

        {mensaje.text && (
          <Text style={mensaje.type === 'danger' ? styles.error : styles.success}>
            {mensaje.text}
          </Text>
        )}

        <View style={styles.pickerContainer}>
          <Text>Seleccionar Curso</Text>
          <Picker
            selectedValue={cursoSeleccionado}
            onValueChange={handleCursoChange}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un curso" value="" />
            {cursos.map((curso) => (
              <Picker.Item
                key={curso.idCurso}
                label={`${curso.numero}${curso.division}`}
                value={curso.idCurso}
              />
            ))}
          </Picker>
        </View>

        {alumnos.length > 0 ? (
          <>
            <Text style={styles.subtitulo}>Lista de Alumnos</Text>
            <FlatList
              data={alumnos}
              keyExtractor={(item) => item.id_usuario.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.alumnoContainer}>
                  <Text style={styles.nombreAlumno}>
                    {item.nombre} {item.apellido}
                  </Text>

                  <View style={styles.checkboxGroup}>
                    {/* Checkbox Presente */}
                    <View style={styles.checkboxContainer}>
                      <Checkbox
                        status={asistencia[index]?.asistio === 1 ? 'checked' : 'unchecked'}
                        onPress={() => handleAsistenciaChange(index, 'asistio')}
                        color="#6200ee"
                      />
                      <Text style={styles.checkboxLabel}>Presente</Text>
                    </View>

                    {/* Checkbox Media Falta */}
                    <View style={styles.checkboxContainer}>
                      <Checkbox
                        status={asistencia[index]?.mediaFalta === 1 ? 'checked' : 'unchecked'}
                        onPress={() => handleAsistenciaChange(index, 'mediaFalta')}
                        color="#6200ee"
                      />
                      <Text style={styles.checkboxLabel}>Media Falta</Text>
                    </View>

                    {/* Checkbox Retiro */}
                    <View style={styles.checkboxContainer}>
                      <Checkbox
                        status={asistencia[index]?.retiroAntes === 1 ? 'checked' : 'unchecked'}
                        onPress={() => handleAsistenciaChange(index, 'retiroAntes')}
                        color="#6200ee"
                      />
                      <Text style={styles.checkboxLabel}>Retiro</Text>
                    </View>
                  </View>
                </View>
              )}
            />
            
            <Button 
              mode="contained" 
              onPress={handleSubmit}
              style={styles.boton}
              loading={loading}
            >
              Registrar Asistencia
            </Button>
          </>
        ) : loading ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : null}
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6200ee',
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  pickerContainer: {
    marginVertical: 15,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  alumnoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  nombreAlumno: {
    flex: 2,
    fontSize: 14,
  },
  checkboxGroup: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 12,
  },
  boton: {
    marginTop: 20,
    backgroundColor: '#6200ee',
  },
  error: {
    color: 'red',
    marginVertical: 10,
  },
  success: {
    color: 'green',
    marginVertical: 10,
  },
});

export default GestionarAsistenciaAlumnos;
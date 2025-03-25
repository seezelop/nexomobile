import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { Checkbox, Button, Provider as PaperProvider } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_BASE_URL } from '../url';
styles

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
  const [modoModificacion, setModoModificacion] = useState(false);

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      const response = await axiosInstance.get('/api/usuario/verCursoPreceptor');
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
      const response = await axiosInstance.get(`/api/usuario/verAlumnosCurso/${cursoId}`);
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
      const response = await axiosInstance.get(`/api/usuario/obtenerAsistencias/${cursoId}`);
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
      if (modoModificacion) {
        fetchFechasAsistencias(itemValue);
      }
    } else {
      setAlumnos([]);
      setAsistencia([]);
      setFechasAsistencias([]);
    }
  };

  const handleAlumnoChange = (itemValue) => {
    setAlumnoSeleccionado(itemValue);
  };

  const fetchAsistenciasPorFecha = async (cursoId) => {
    if (!cursoId) return;

    setLoading(true);
    console.log('PARAMETROS: ', { cursoId });
    try {
      const response = await axiosInstance.get(
        `/api/usuario/obtenerAsistencias/${cursoId}`
      );

      const asistenciasData = response.data;
      const asistenciaActualizada = alumnos.map(alumno => {
        const asistenciaAlumno = asistenciasData.find(a => a.idUsuario === alumno.id_usuario);
        return {
          idUsuario: alumno.id_usuario,
          asistio: asistenciaAlumno ? asistenciaAlumno.asistio : 0,
          mediaFalta: asistenciaAlumno ? asistenciaAlumno.mediaFalta : 0,
          retiroAntes: asistenciaAlumno ? asistenciaAlumno.retiroAntes : 0,
        };
      });

      setAsistencia(asistenciaActualizada);
    } catch (error) {
      console.error('Error al obtener asistencias por fecha:', error);
      setMensaje({ text: 'Hubo un error al cargar las asistencias.', type: 'danger' });
    } finally {
      setLoading(false);
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

      const response = await axiosInstance.post(
        `/api/usuario/tomarAsistencia/${cursoSeleccionado}`,
        dataToSend
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

  const handleFechaChange = (itemValue) => {
    setIdAsistenciaSeleccionada(itemValue);
    const asistenciaSeleccionada = fechasAsistencias.find(a => a.idAsistencia === parseInt(itemValue));
    if (asistenciaSeleccionada) {
      setFechaSeleccionada(asistenciaSeleccionada.fecha);
      fetchAsistenciasPorFecha(cursoSeleccionado, asistenciaSeleccionada.fecha);
    } else {
      setFechaSeleccionada('');
    }
  };

  const handleEditarAsistencia = async () => {
    if (!cursoSeleccionado || !fechaSeleccionada || !alumnoSeleccionado) {
      setMensaje({ text: 'Debe seleccionar un curso, fecha y alumno.', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      // Encontrar el índice del alumno seleccionado
      const alumnoIndex = alumnos.findIndex(alumno => alumno.id_usuario === parseInt(alumnoSeleccionado));

      if (alumnoIndex === -1) {
        setMensaje({ text: 'Alumno no encontrado.', type: 'danger' });
        setLoading(false);
        return;
      }

      // Preparar los datos de asistencia para el alumno seleccionado
      const asistenciaAlumno = [asistencia[alumnoIndex]];

      const response = await axiosInstance.patch(
        `/api/usuario/editarAsistencia/${cursoSeleccionado}?fecha=${fechaSeleccionada}`,
        asistenciaAlumno
      );

      if (response.status === 200) {
        setMensaje({ text: 'Asistencia editada correctamente.', type: 'success' });
      }
    } catch (error) {
      console.error('Error al editar asistencia:', error);
      setMensaje({
        text: `Error al editar la asistencia: ${error.response?.data || error.message}`,
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleModoModificacion = () => {
    const nuevoModo = !modoModificacion;
    setModoModificacion(nuevoModo);

    // Resetear estados
    setCursoSeleccionado('');
    setAlumnos([]);
    setAsistencia([]);
    setFechasAsistencias([]);
    setAlumnoSeleccionado('');
    setFechaSeleccionada('');
    setIdAsistenciaSeleccionada('');
  };

  return (
    <PaperProvider>
      <ScrollView style={styles.container}>
        <Button
          mode="outlined"
          onPress={toggleModoModificacion}
          style={styles.modoBoton}
        >
          {modoModificacion ? 'Tomar Asistencia' : 'Modificar Asistencia'}
        </Button>

        <Text style={styles.titulo}>
          {modoModificacion ? 'Modificar Asistencia' : 'Tomar Asistencia'}
        </Text>

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

        {modoModificacion && (
          <>
            <View style={styles.pickerContainer}>
              <Text>Seleccionar Fecha</Text>
              <Picker
                selectedValue={idAsistenciaSeleccionada}
                onValueChange={handleFechaChange}
                style={styles.picker}
                enabled={!!cursoSeleccionado}
              >
                <Picker.Item label="Seleccione una fecha" value="" />
                {fechasAsistencias.map((asistencia) => (
                  <Picker.Item
                    key={asistencia.idAsistencia}
                    label={asistencia.fecha}
                    value={asistencia.idAsistencia}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
              <Text>Seleccionar Alumno</Text>
              <Picker
                selectedValue={alumnoSeleccionado}
                onValueChange={handleAlumnoChange}
                style={styles.picker}
                enabled={!!cursoSeleccionado && !!idAsistenciaSeleccionada}
              >
                <Picker.Item label="Seleccione un alumno" value="" />
                {alumnos.map((alumno) => (
                  <Picker.Item
                    key={alumno.id_usuario}
                    label={`${alumno.nombre} ${alumno.apellido}`}
                    value={alumno.id_usuario}
                  />
                ))}
              </Picker>
            </View>
          </>
        )}

        {((!modoModificacion && alumnos.length > 0) ||
          (modoModificacion && alumnoSeleccionado)) ? (
          <>
            <Text style={styles.subtitulo}>
              {modoModificacion ? 'Modificar Asistencia del Alumno' : 'Lista de Alumnos'}
            </Text>

            {!modoModificacion ? (
              <FlatList
                data={alumnos}
                keyExtractor={(item) => item.id_usuario.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.alumnoContainer}>
                    <Text style={styles.nombreAlumno}>
                      {item.nombre} {item.apellido}
                    </Text>

                    <View style={styles.checkboxGroup}>
                      {/* Checkboxes para Tomar Asistencia */}
                      <View style={styles.checkboxContainer}>
                        <Checkbox
                          status={asistencia[index]?.asistio === 1 ? 'checked' : 'unchecked'}
                          onPress={() => handleAsistenciaChange(index, 'asistio')}
                          color="#6200ee"
                        />
                        <Text style={styles.checkboxLabel}>Presente</Text>
                      </View>

                      <View style={styles.checkboxContainer}>
                        <Checkbox
                          status={asistencia[index]?.mediaFalta === 1 ? 'checked' : 'unchecked'}
                          onPress={() => handleAsistenciaChange(index, 'mediaFalta')}
                          color="#6200ee"
                        />
                        <Text style={styles.checkboxLabel}>Media Falta</Text>
                      </View>

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
            ) : (
              // Modificación de Asistencia para un alumno específico
              <View style={styles.alumnoContainer}>
                <Text style={styles.nombreAlumno}>
                  {alumnos.find(a => a.id_usuario === parseInt(alumnoSeleccionado))?.nombre}{' '}
                  {alumnos.find(a => a.id_usuario === parseInt(alumnoSeleccionado))?.apellido}
                </Text>

                <View style={styles.checkboxGroup}>
                  <View style={styles.checkboxContainer}>
                    <Checkbox
                      status={asistencia.find(a => a.idUsuario === parseInt(alumnoSeleccionado))?.asistio === 1 ? 'checked' : 'unchecked'}
                      onPress={() => {
                        const index = alumnos.findIndex(a => a.id_usuario === parseInt(alumnoSeleccionado));
                        handleAsistenciaChange(index, 'asistio');
                      }}
                      color="#6200ee"
                    />
                    <Text style={styles.checkboxLabel}>Presente</Text>
                  </View>

                  <View style={styles.checkboxContainer}>
                    <Checkbox
                      status={asistencia.find(a => a.idUsuario === parseInt(alumnoSeleccionado))?.mediaFalta === 1 ? 'checked' : 'unchecked'}
                      onPress={() => {
                        const index = alumnos.findIndex(a => a.id_usuario === parseInt(alumnoSeleccionado));
                        handleAsistenciaChange(index, 'mediaFalta');
                      }}
                      color="#6200ee"
                    />
                    <Text style={styles.checkboxLabel}>Media Falta</Text>
                  </View>

                  <View style={styles.checkboxContainer}>
                    <Checkbox
                      status={asistencia.find(a => a.idUsuario === parseInt(alumnoSeleccionado))?.retiroAntes === 1 ? 'checked' : 'unchecked'}
                      onPress={() => {
                        const index = alumnos.findIndex(a => a.id_usuario === parseInt(alumnoSeleccionado));
                        handleAsistenciaChange(index, 'retiroAntes');
                      }}
                      color="#6200ee"
                    />
                    <Text style={styles.checkboxLabel}>Retiro</Text>
                  </View>
                </View>
              </View>
            )}

            <Button
              mode="contained"
              onPress={modoModificacion ? handleEditarAsistencia : handleSubmit}
              style={styles.boton}
              loading={loading}
              disabled={
                (modoModificacion && (!alumnoSeleccionado || !fechaSeleccionada)) ||
                (!modoModificacion && !cursoSeleccionado)
              }
            >
              {modoModificacion ? 'Editar Asistencia' : 'Registrar Asistencia'}
            </Button>
          </>
        ) : loading ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : null}
      </ScrollView>
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
  modoBoton: {
    marginBottom: 15,
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

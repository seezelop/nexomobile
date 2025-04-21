import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { Card, CheckBox } from 'react-native-elements';
import { API_BASE_URL } from  '../../url';

const GestionarAsistenciaAlumnos = () => {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
  const [asistencia, setAsistencia] = useState([]);
  const [fechasAsistencias, setFechasAsistencias] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [loading, setLoading] = useState({
    general: false,
    guardando: false,
    editando: false
  });
  const [modo, setModo] = useState('tomar');

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/usuario/verCursoPreceptor`, {
          withCredentials: true,
        });
        setCursos(response.data);
      } catch (error) {
        console.error('Error al obtener cursos:', error);
        Alert.alert('Error', 'Hubo un problema al cargar los cursos');
      }
    };
    fetchCursos();
  }, []);

  useEffect(() => {
    if (cursoSeleccionado) {
      fetchAlumnos(cursoSeleccionado);
      fetchFechasAsistencias(cursoSeleccionado);
    } else {
      setAlumnos([]);
      setAsistencia([]);
      setFechasAsistencias([]);
    }
  }, [cursoSeleccionado]);

  const fetchAlumnos = async (cursoId) => {
    setLoading(prev => ({ ...prev, general: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/api/usuario/verAlumnosCurso/${cursoId}`, {
        withCredentials: true,
      });

      const alumnosData = response.data;
      setAlumnos(alumnosData);
      const asistenciaInicial = alumnosData.map(alumno => ({
        idUsuario: alumno.id_usuario,
        asistio: 0,
        mediaFalta: 0,
        retiroAntes: 0,
      }));
      setAsistencia(asistenciaInicial);
    } catch (error) {
      console.error('Error al obtener alumnos:', error);
      Alert.alert('Error', 'Hubo un problema al cargar los alumnos');
    } finally {
      setLoading(prev => ({ ...prev, general: false }));
    }
  };

  const fetchFechasAsistencias = async (cursoId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/usuario/obtenerAsistencia/${cursoId}`,
        { withCredentials: true }
      );
      const data = Array.isArray(response.data) ? response.data : [response.data];
      setFechasAsistencias(data);
    } catch (error) {
      console.error('Error al obtener fechas de asistencias:', error);
      Alert.alert('Error', 'Hubo un problema al cargar las fechas de asistencia');
    }
  };

  const handleAsistenciaChange = (index, field, value) => {
    const updatedAsistencia = [...asistencia];
    updatedAsistencia[index] = {
      ...updatedAsistencia[index],
      [field]: value,
      ...(field === 'asistio' && { mediaFalta: 0, retiroAntes: 0 }),
      ...(field === 'mediaFalta' && { asistio: 0, retiroAntes: 0 }),
      ...(field === 'retiroAntes' && { asistio: 0, mediaFalta: 0 })
    };
    setAsistencia(updatedAsistencia);
  };

  const handleTomarAsistencia = async () => {
    if (!cursoSeleccionado) {
      Alert.alert('Atención', 'Debe seleccionar un curso');
      return;
    }

    setLoading(prev => ({ ...prev, guardando: true }));
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/usuario/tomarAsistencia/${cursoSeleccionado}`,
        { alumnosCurso: asistencia },
        { withCredentials: true }
      );

      if (response.status === 201) {
        Alert.alert('Éxito', 'Asistencia registrada correctamente');
        fetchFechasAsistencias(cursoSeleccionado);
      }
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      Alert.alert('Error', error.response?.data?.message || 'Error al registrar asistencia');
    } finally {
      setLoading(prev => ({ ...prev, guardando: false }));
    }
  };

  const handleModificarAsistencia = async () => {
    if (!cursoSeleccionado || !fechaSeleccionada || !alumnoSeleccionado) {
      Alert.alert('Atención', 'Debe seleccionar curso, fecha y alumno');
      return;
    }

    setLoading(prev => ({ ...prev, editando: true }));
    try {
      const alumnoIndex = alumnos.findIndex(a => a.id_usuario === parseInt(alumnoSeleccionado));
      if (alumnoIndex === -1) {
        throw new Error('Alumno no encontrado');
      }

      const asistenciaAlumno = [{
        idUsuario: parseInt(alumnoSeleccionado),
        ...asistencia[alumnoIndex]
      }];

      const response = await axios.patch(
        `${API_BASE_URL}/api/usuario/editarAsistencia/${cursoSeleccionado}?fecha=${fechaSeleccionada}`,
        asistenciaAlumno,
        { withCredentials: true }
      );

      if (response.status === 200) {
        Alert.alert('Éxito', 'Asistencia modificada correctamente');
      }
    } catch (error) {
      console.error('Error al modificar asistencia:', error);
      Alert.alert('Error', error.response?.data?.message || 'Error al modificar asistencia');
    } finally {
      setLoading(prev => ({ ...prev, editando: false }));
    }
  };

  const formatFecha = (fechaStr) => {
    // Asegurarnos de que fechaStr es una cadena y que no es un objeto
    if (typeof fechaStr !== 'string' || !fechaStr) {
      console.error('Fecha inválida:', fechaStr);
      return ''; // Retorna un valor vacío si no es una cadena válida
    }
  
    const fecha = new Date(fechaStr);  // Crear el objeto Date
  
    // Verificar si la fecha es válida
    if (isNaN(fecha)) {
      console.error('Fecha inválida:', fechaStr);
      return '';  // Retorna un valor vacío si la fecha es inválida
    }
  
    // Formatear la fecha como dd/mm/yyyy
    const day = fecha.getDate().toString().padStart(2, '0');  // Día con dos dígitos
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');  // Mes con dos dígitos
    const year = fecha.getFullYear();  // Año con cuatro dígitos
  
    return `${day}/${month}/${year}`;  // Formato final: dd/mm/yyyy
  };
  
  

  const renderAlumnoItem = ({ item, index }) => {
    if (modo === 'modificar' && item.id_usuario.toString() !== alumnoSeleccionado) return null;

    return (
      <View style={styles.alumnoItem}>
        <Text style={styles.alumnoNombre}>{item.nombre} {item.apellido}</Text>

        <View style={styles.checkboxContainer}>
          <CheckBox
            title="Presente"
            checked={asistencia[index]?.asistio === 1}
            onPress={() => handleAsistenciaChange(index, 'asistio', asistencia[index]?.asistio === 1 ? 0 : 1)}
            containerStyle={styles.checkbox}
          />
          <CheckBox
            title="Media Falta"
            checked={asistencia[index]?.mediaFalta === 1}
            onPress={() => handleAsistenciaChange(index, 'mediaFalta', asistencia[index]?.mediaFalta === 1 ? 0 : 1)}
            containerStyle={styles.checkbox}
          />
          <CheckBox
            title="Retiro"
            checked={asistencia[index]?.retiroAntes === 1}
            onPress={() => handleAsistenciaChange(index, 'retiroAntes', asistencia[index]?.retiroAntes === 1 ? 0 : 1)}
            containerStyle={styles.checkbox}
          />
        </View>
      </View>
    );
  };

  return (
    <FlatList style={styles.container} ListHeaderComponent={
      <>
        <View style={styles.header}>
          <Text style={styles.title}>Gestión de Asistencia</Text>

          <View style={styles.modoContainer}>
            <TouchableOpacity
              style={[styles.modoButton, modo === 'tomar' && styles.modoButtonActive]}
              onPress={() => setModo('tomar')}
            >
              <Text style={[styles.modoButtonText, modo === 'tomar' && styles.modoButtonTextActive]}>
                Tomar Asistencia
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modoButton, modo === 'modificar' && styles.modoButtonActive]}
              onPress={() => setModo('modificar')}
            >
              <Text style={[styles.modoButtonText, modo === 'modificar' && styles.modoButtonTextActive]}>
                Modificar Asistencia
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Selección de Curso</Text>
          <View style={styles.divider} />

          {loading.general ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Picker
              selectedValue={cursoSeleccionado}
              onValueChange={(itemValue) => setCursoSeleccionado(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione un curso" value="" />
              {cursos.map((curso) => (
                <Picker.Item
                  key={curso.idCurso}
                  label={`${curso.numero}° ${curso.division}`}
                  value={curso.idCurso}
                />
              ))}
            </Picker>
          )}
        </View>

        {modo === 'tomar' ? (
          <Card containerStyle={styles.card}>
            <Card.Title>Tomar Asistencia</Card.Title>
            <Card.Divider />

            {alumnos.length > 0 ? (
              <>
                <FlatList
                  data={alumnos}
                  renderItem={renderAlumnoItem}
                  keyExtractor={(item) => item.id_usuario.toString()}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleTomarAsistencia}
                  disabled={loading.guardando}
                >
                  {loading.guardando ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Guardar Asistencia</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.emptyText}>
                {cursoSeleccionado ? 'No hay alumnos en este curso' : 'Seleccione un curso'}
              </Text>
            )}
          </Card>
        ) : (
          <Card containerStyle={styles.card}>
            <Card.Title>Modificar Asistencia</Card.Title>
            <Card.Divider />

            <Text>Fecha de asistencia:</Text>
            <Picker
              selectedValue={fechaSeleccionada}
              onValueChange={(itemValue) => setFechaSeleccionada(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una fecha" value="" />
              {fechasAsistencias.map((asistencia, index) => (
                <Picker.Item key={index} label={formatFecha(asistencia.fecha)} value={asistencia.fecha} />
              ))}
            </Picker>

            <Text>Alumno:</Text>
            <Picker
              selectedValue={alumnoSeleccionado}
              onValueChange={(itemValue) => setAlumnoSeleccionado(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione un alumno" value="" />
              {alumnos.map((alumno) => (
                <Picker.Item
                  key={alumno.id_usuario}
                  label={`${alumno.nombre} ${alumno.apellido}`}
                  value={alumno.id_usuario.toString()}
                />
              ))}
            </Picker>

            {alumnoSeleccionado && (
              <>
                <FlatList
                  data={alumnos}
                  renderItem={renderAlumnoItem}
                  keyExtractor={(item) => item.id_usuario.toString()}
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleModificarAsistencia}
                  disabled={loading.editando}
                >
                  {loading.editando ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Guardar Cambios</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </Card>
        )}
      </>
    } />
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  modoContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  modoButton: { padding: 10, marginHorizontal: 5, borderRadius: 5, backgroundColor: '#ccc' },
  modoButtonActive: { backgroundColor: '#007bff' },
  modoButtonText: { color: '#000' },
  modoButtonTextActive: { color: '#fff' },
  card: { margin: 10, padding: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 5 },
  picker: { height: 50, width: '100%' },
  alumnoItem: { marginVertical: 10 },
  alumnoNombre: { fontWeight: 'bold', marginBottom: 5 },
  checkboxContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  checkbox: { flex: 1, backgroundColor: 'transparent', borderWidth: 0 },
  button: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { color: 'white', textAlign: 'center' },
  emptyText: { textAlign: 'center', marginTop: 20 }
});

export default GestionarAsistenciaAlumnos;

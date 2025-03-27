import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert,TouchableOpacity,FlatList
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { Card, CheckBox } from 'react-native-elements';
import { API_BASE_URL } from "../url";

const GestionarAsistenciaAlumnos = () => {
  // Estados
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
  const [modo, setModo] = useState('tomar'); // 'tomar' o 'modificar'

  // Cargar cursos al montar el componente
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

  // Cargar alumnos cuando se selecciona un curso
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

  // Obtener alumnos del curso
  const fetchAlumnos = async (cursoId) => {
    setLoading(prev => ({ ...prev, general: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/api/usuario/verAlumnosCurso/${cursoId}`, {
        withCredentials: true,
      });

      const alumnosData = response.data;
      setAlumnos(alumnosData);

      // Inicializar estado de asistencia
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

  // Obtener fechas de asistencias
  const fetchFechasAsistencias = async (cursoId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/usuario/obtenerAsistencia/${cursoId}`,
        { withCredentials: true }
      );
      
      // Asegurar que siempre trabajamos con un array
      const data = Array.isArray(response.data) ? response.data : [response.data];
      setFechasAsistencias(data);
    } catch (error) {
      console.error('Error al obtener fechas de asistencias:', error);
      Alert.alert('Error', 'Hubo un problema al cargar las fechas de asistencia');
    }
  };

  // Manejar cambios en la asistencia
  const handleAsistenciaChange = (index, field, value) => {
    const updatedAsistencia = [...asistencia];
    updatedAsistencia[index] = {
      ...updatedAsistencia[index],
      [field]: value,
      // Asegurar que solo un campo esté activo a la vez
      ...(field === 'asistio' && { mediaFalta: 0, retiroAntes: 0 }),
      ...(field === 'mediaFalta' && { asistio: 0, retiroAntes: 0 }),
      ...(field === 'retiroAntes' && { asistio: 0, mediaFalta: 0 })
    };
    setAsistencia(updatedAsistencia);
  };

  // Tomar asistencia
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

  // Modificar asistencia
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

  // Formatear fecha para mostrar
  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-AR');
  };

  // Renderizar item de alumno
  const renderAlumnoItem = ({ item, index }) => (
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

  return (
    <ScrollView style={styles.container}>
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
                ListHeaderComponent={() => (
                  <View style={styles.listHeader}>
                    <Text style={styles.listHeaderText}>Alumno</Text>
                    <Text style={styles.listHeaderText}>Asistencia</Text>
                  </View>
                )}
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
          
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Fecha de Asistencia:</Text>
            <Picker
              selectedValue={fechaSeleccionada}
              onValueChange={(itemValue) => setFechaSeleccionada(itemValue)}
              style={styles.picker}
              enabled={!!cursoSeleccionado}
            >
              <Picker.Item label="Seleccione una fecha" value="" />
              {fechasAsistencias.map((asistencia, index) => (
                <Picker.Item 
                  key={index} 
                  label={formatFecha(asistencia.fecha)} 
                  value={asistencia.fecha} 
                />
              ))}
            </Picker>
          </View>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Alumno:</Text>
            <Picker
              selectedValue={alumnoSeleccionado}
              onValueChange={(itemValue) => setAlumnoSeleccionado(itemValue)}
              style={styles.picker}
              enabled={!!cursoSeleccionado}
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
          </View>
          
          {alumnoSeleccionado && (
            <>
              <Text style={styles.alumnoSeleccionado}>
                {alumnos.find(a => a.id_usuario === parseInt(alumnoSeleccionado))?.nombre} {''}
                {alumnos.find(a => a.id_usuario === parseInt(alumnoSeleccionado))?.apellido}
              </Text>
              
              <View style={styles.checkboxContainer}>
                <CheckBox
                  title="Presente"
                  checked={asistencia.find(a => a.idUsuario === parseInt(alumnoSeleccionado))?.asistio === 1}
                  onPress={() => {
                    const index = alumnos.findIndex(a => a.id_usuario === parseInt(alumnoSeleccionado));
                    if (index !== -1) {
                      handleAsistenciaChange(index, 'asistio', 
                        asistencia[index]?.asistio === 1 ? 0 : 1);
                    }
                  }}
                />
                <CheckBox
                  title="Media Falta"
                  checked={asistencia.find(a => a.idUsuario === parseInt(alumnoSeleccionado))?.mediaFalta === 1}
                  onPress={() => {
                    const index = alumnos.findIndex(a => a.id_usuario === parseInt(alumnoSeleccionado));
                    if (index !== -1) {
                      handleAsistenciaChange(index, 'mediaFalta', 
                        asistencia[index]?.mediaFalta === 1 ? 0 : 1);
                    }
                  }}
                />
                <CheckBox
                  title="Retiro Anticipado"
                  checked={asistencia.find(a => a.idUsuario === parseInt(alumnoSeleccionado))?.retiroAntes === 1}
                  onPress={() => {
                    const index = alumnos.findIndex(a => a.id_usuario === parseInt(alumnoSeleccionado));
                    if (index !== -1) {
                      handleAsistenciaChange(index, 'retiroAntes', 
                        asistencia[index]?.retiroAntes === 1 ? 0 : 1);
                    }
                  }}
                />
              </View>
              
              <TouchableOpacity
                style={styles.button}
                onPress={handleModificarAsistencia}
                disabled={loading.editando || !fechaSeleccionada}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modoButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  modoButtonActive: {
    backgroundColor: '#007bff',
  },
  modoButtonText: {
    color: '#333',
  },
  modoButtonTextActive: {
    color: 'white',
  },
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  picker: {
    width: '100%',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  alumnoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  alumnoNombre: {
    flex: 1,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
    marginLeft: 10,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  listHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alumnoSeleccionado: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#333',
  },
});

export default GestionarAsistenciaAlumnos;
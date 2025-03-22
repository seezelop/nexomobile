import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

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

  // Cargar los cursos al iniciar el componente
  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/usuario/verCursoPreceptor', { withCredentials: true });
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
      const response = await axios.get(`http://localhost:8080/api/usuario/verAlumnosCurso/${cursoId}`, { withCredentials: true });
      const alumnosData = response.data;
      setAlumnos(alumnosData);

      const asistenciaInicial = alumnosData.map(alumno => ({
        idUsuario: alumno.id_usuario,
        asistio: 0,
        mediaFalta: 0,
        retiroAntes: 0,
      }));

      setAsistencia(asistenciaInicial);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener alumnos:', error);
      setMensaje({ text: 'Hubo un error al cargar los alumnos del curso.', type: 'danger' });
      setLoading(false);
    }
  };

  const handleCursoChange = (cursoId) => {
    setCursoSeleccionado(cursoId);
    if (cursoId) {
      fetchAlumnos(cursoId);
    } else {
      setAlumnos([]);
      setAsistencia([]);
    }
  };

  const handleAsistenciaChange = (index, field, value) => {
    const updatedAsistencia = [...asistencia];
    updatedAsistencia[index] = {
      ...updatedAsistencia[index],
      [field]: value,
    };
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
      const dataToSend = { alumnosCurso: asistencia };
      const response = await axios.post(`http://localhost:8080/api/usuario/tomarAsistencia/${cursoSeleccionado}`, dataToSend, { withCredentials: true });

      if (response.status === 201) {
        setMensaje({ text: 'Asistencia registrada correctamente.', type: 'success' });
      }
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      setMensaje({ text: `Error al registrar la asistencia: ${error.response?.data || error.message}`, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleAlumnoChange = (alumnoId) => {
    setAlumnoSeleccionado(alumnoId);
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Tomar Asistencia</Text>

      {mensaje.text && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: mensaje.type === 'danger' ? 'red' : 'green' }}>
            {mensaje.text}
          </Text>
        </View>
      )}

      <View style={{ marginBottom: 16 }}>
        <Text>Seleccionar Curso</Text>
        <Picker
          selectedValue={cursoSeleccionado}
          onValueChange={handleCursoChange}
        >
          <Picker.Item label="Seleccione un curso" value="" />
          {cursos.map(curso => (
            <Picker.Item key={curso.id_curso} label={curso.nombre} value={curso.id_curso} />
          ))}
        </Picker>
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      <FlatList
        data={alumnos}
        keyExtractor={item => item.id_usuario.toString()}
        renderItem={({ item, index }) => (
          <View style={{ marginBottom: 10 }}>
            <Text>{item.nombre}</Text>
            <Picker
              selectedValue={asistencia[index]?.asistio}
              onValueChange={(value) => handleAsistenciaChange(index, 'asistio', value)}
            >
              <Picker.Item label="Asistió" value={1} />
              <Picker.Item label="No Asistió" value={0} />
            </Picker>
          </View>
        )}
      />

      <Button title="Registrar Asistencia" onPress={handleSubmit} />
    </View>
  );
};

export default GestionarAsistenciaAlumnos;

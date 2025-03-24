import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Picker, FlatList, CheckBox, Alert, ActivityIndicator } from 'react-native';
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

  // Obtener los cursos asignados al preceptor
  const fetchCursos = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/usuario/verCursoPreceptor', {
        withCredentials: true,
      });
      setCursos(response.data);
    } catch (error) {
      console.error('Error al obtener cursos:', error);
      setMensaje({ text: 'Hubo un error al cargar los cursos.', type: 'danger' });
    }
  };

  // Obtener los alumnos del curso seleccionado
  const fetchAlumnos = async (cursoId) => {
    if (!cursoId) return;

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/usuario/verAlumnosCurso/${cursoId}`, {
        withCredentials: true,
      });

      const alumnosData = response.data;
      setAlumnos(alumnosData);

      // Inicializar el estado de asistencia para cada alumno
      const asistenciaInicial = alumnosData.map(alumno => ({
        idUsuario: alumno.id_usuario,
        asistio: 0, // Ausente por defecto
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

  // Obtener fechas de asistencias
  const fetchFechasAsistencias = async (cursoId) => {
    if (!cursoId) return;

    try {
      const response = await axios.get(
        `http://localhost:8080/api/usuario/obtenerAsistencias/${cursoId}`,
        { withCredentials: true }
      );
      setFechasAsistencias(response.data);
    } catch (error) {
      console.error('Error al obtener fechas de asistencias:', error);
      setMensaje({ text: 'Hubo un error al cargar las fechas de asistencias.', type: 'danger' });
    }
  };

  // Manejar el cambio de curso seleccionado
  const handleCursoChange = (itemValue) => {
    setCursoSeleccionado(itemValue);
    if (itemValue) {
      fetchAlumnos(itemValue);
    } else {
      setAlumnos([]);
      setAsistencia([]);
    }
  };

  // Manejar el cambio de alumno seleccionado
  const handleAlumnoChange = (itemValue) => {
    setAlumnoSeleccionado(itemValue);
  };

  // Manejar el cambio de fecha seleccionada
  const handleFechaChange = (itemValue) => {
    setIdAsistenciaSeleccionada(itemValue);

    // Encontrar la fecha correspondiente al ID de asistencia seleccionado
    const asistenciaSeleccionada = fechasAsistencias.find(a => a.idAsistencia === parseInt(itemValue));
    if (asistenciaSeleccionada) {
      setFechaSeleccionada(asistenciaSeleccionada.fecha);
    } else {
      setFechaSeleccionada('');
    }
  };

  // Manejar cambios en la asistencia de un alumno
  const handleAsistenciaChange = (index, field, value) => {
    const updatedAsistencia = [...asistencia];

    if (field === 'asistio') {
      updatedAsistencia[index] = {
        ...updatedAsistencia[index],
        asistio: value,
        mediaFalta: value === 1 ? 0 : updatedAsistencia[index].mediaFalta,
        retiroAntes: value === 1 ? 0 : updatedAsistencia[index].retiroAntes,
      };
    } else if (field === 'mediaFalta') {
      updatedAsistencia[index] = {
        ...updatedAsistencia[index],
        mediaFalta: value,
        asistio: value === 1 ? 0 : updatedAsistencia[index].asistio,
        retiroAntes: value === 1 ? 0 : updatedAsistencia[index].retiroAntes,
      };
    } else if (field === 'retiroAntes') {
      updatedAsistencia[index] = {
        ...updatedAsistencia[index],
        retiroAntes: value,
        asistio: value === 1 ? 0 : updatedAsistencia[index].asistio,
        mediaFalta: value === 1 ? 0 : updatedAsistencia[index].mediaFalta,
      };
    }

    setAsistencia(updatedAsistencia);
  };

  // Enviar la asistencia al backend (Tomar Asistencia)
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

      const response = await axios.post(
        `http://localhost:8080/api/usuario/tomarAsistencia/${cursoSeleccionado}`,
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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Tomar Asistencia</Text>

      {mensaje.text && (
        <Text style={{ color: mensaje.type === 'danger' ? 'red' : 'green', marginVertical: 10 }}>
          {mensaje.text}
        </Text>
      )}

      <View style={{ marginVertical: 20 }}>
        <Text>Seleccionar Curso</Text>
        <Picker
          selectedValue={cursoSeleccionado}
          onValueChange={handleCursoChange}
          style={{ height: 50, width: 250 }}
        >
          <Picker.Item label="Seleccione un curso" value="" />
          {cursos.map((curso) => (
            <Picker.Item key={curso.idCurso} label={`${curso.numero}${curso.division}`} value={curso.idCurso} />
          ))}
        </Picker>
      </View>

      {alumnos.length > 0 ? (
        <>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Lista de Alumnos</Text>
          <FlatList
            data={alumnos}
            keyExtractor={(item) => item.id_usuario.toString()}
            renderItem={({ item, index }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                <Text style={{ flex: 1 }}>{item.nombre} {item.apellido}</Text>
                <CheckBox
                  value={asistencia[index]?.asistio === 1}
                  onValueChange={(value) =>
                    handleAsistenciaChange(index, 'asistio', value ? 1 : 0)
                  }
                />
                <Text>Presente</Text>
                <CheckBox
                  value={asistencia[index]?.mediaFalta === 1}
                  onValueChange={(value) =>
                    handleAsistenciaChange(index, 'mediaFalta', value ? 1 : 0)
                  }
                />
                <Text>Media Falta</Text>
                <CheckBox
                  value={asistencia[index]?.retiroAntes === 1}
                  onValueChange={(value) =>
                    handleAsistenciaChange(index, 'retiroAntes', value ? 1 : 0)
                  }
                />
                <Text>Retiro antes</Text>
              </View>
            )}
          />
          <Button title="Registrar Asistencia" onPress={handleSubmit} />
        </>
      ) : loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : null}
    </View>
  );
};

export default GestionarAsistenciaAlumnos;

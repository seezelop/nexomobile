import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { Checkbox, Button, Provider as PaperProvider } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_BASE_URL } from '../url';

const GestionarAsistenciaProfesor = () => {
  const [profesores, setProfesores] = useState([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState('');
  const [asistencia, setAsistencia] = useState([]);
  const [fechasAsistencias, setFechasAsistencias] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [idAsistenciaSeleccionada, setIdAsistenciaSeleccionada] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ text: '', type: '' });
  const [modoModificacion, setModoModificacion] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  useEffect(() => {
    fetchProfesores();
    checkPremiumStatus();
  }, []);

  useEffect(() => {
    if (modoModificacion) {
      fetchFechasAsistencias();
    }
  }, [modoModificacion]);

  const checkPremiumStatus = async () => {
    try {
      const response = await axiosInstance.get('/api/usuario/getPlanEscuela');
      setIsPremium(response.data === 2);
    } catch (error) {
      console.error('Error al verificar estado premium:', error);
    }
  };

  const fetchProfesores = async () => {
    try {
      const response = await axiosInstance.get('/api/usuario/verProfesAdministrativo');
      setProfesores(response.data);

      const asistenciaInicial = response.data.map(profesor => ({
        idUsuario: profesor.id_usuario,
        asistio: 0,
        mediaFalta: 0,
        retiroAntes: 0,
      }));
      setAsistencia(asistenciaInicial);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      setMensaje({ text: 'Hubo un error al cargar los profesores.', type: 'danger' });
    }
  };

  const fetchFechasAsistencias = async () => {
    try {
      const response = await axiosInstance.get('/api/usuario/obtenerAsistenciasProfe');
      setFechasAsistencias(response.data);
    } catch (error) {
      console.error('Error al obtener fechas de asistencias:', error);
      setMensaje({ text: 'Hubo un error al cargar las fechas de asistencias.', type: 'danger' });
    }
  };

  const fetchAsistenciasPorFecha = async (fecha) => {
    setLoading(true);
    try {
      const asistenciaActualizada = profesores.map(profesor => {
        const asistenciaProfesor = fechasAsistencias.find(a => 
          a.fecha === fecha && a.idUsuario === profesor.id_usuario
        );
        return {
          idUsuario: profesor.id_usuario,
          asistio: asistenciaProfesor ? asistenciaProfesor.asistio : 0,
          mediaFalta: asistenciaProfesor ? asistenciaProfesor.mediaFalta : 0,
          retiroAntes: asistenciaProfesor ? asistenciaProfesor.retiroAntes : 0,
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

  const handleProfesorChange = (itemValue) => {
    setProfesorSeleccionado(itemValue);
  };

  const handleAsistenciaChange = (index, field) => {
    const updatedAsistencia = [...asistencia];
    
    updatedAsistencia[index] = {
      ...updatedAsistencia[index],
      asistio: 0,
      mediaFalta: 0,
      retiroAntes: 0,
    };

    updatedAsistencia[index][field] = 1;

    setAsistencia(updatedAsistencia);
  };

  const handleSubmit = async () => {
    if (!profesorSeleccionado) {
      setMensaje({ text: 'Debe seleccionar un profesor.', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const profesorIndex = profesores.findIndex(p => p.id_usuario === parseInt(profesorSeleccionado));
      const dataToSend = {
        alumnosCurso: [asistencia[profesorIndex]]
      };

      const response = await axiosInstance.post(
        '/api/usuario/tomarAsistenciaProfesor',
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
    const asistenciaSeleccionada = fechasAsistencias.find(a => a.fecha === itemValue);
    if (asistenciaSeleccionada) {
      setFechaSeleccionada(asistenciaSeleccionada.fecha);
      fetchAsistenciasPorFecha(asistenciaSeleccionada.fecha);
    } else {
      setFechaSeleccionada('');
    }
  };

  const handleEditarAsistencia = async () => {
    if (!fechaSeleccionada || !profesorSeleccionado) {
      setMensaje({ text: 'Debe seleccionar una fecha y un profesor.', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const profesorIndex = profesores.findIndex(p => p.id_usuario === parseInt(profesorSeleccionado));
      const asistenciaProfesor = [asistencia[profesorIndex]];

      const response = await axiosInstance.patch(
        `/api/usuario/editarAsistenciaProfe?fecha=${fechaSeleccionada}`,
        asistenciaProfesor
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

    setProfesorSeleccionado('');
    setAsistencia(profesores.map(p => ({
      idUsuario: p.id_usuario,
      asistio: 0,
      mediaFalta: 0,
      retiroAntes: 0,
    })));
    setFechasAsistencias([]);
    setFechaSeleccionada('');
    setIdAsistenciaSeleccionada('');
  };

  const renderCheckboxes = () => {
    const opciones = [
      { 
        campo: 'asistio', 
        label: 'Presente', 
        valor: asistencia.find(a => a.idUsuario === parseInt(profesorSeleccionado))?.asistio 
      },
      { 
        campo: 'mediaFalta', 
        label: 'Media Falta', 
        valor: asistencia.find(a => a.idUsuario === parseInt(profesorSeleccionado))?.mediaFalta 
      },
      { 
        campo: 'retiroAntes', 
        label: 'Retiro', 
        valor: asistencia.find(a => a.idUsuario === parseInt(profesorSeleccionado))?.retiroAntes 
      }
    ];

    return (
      <FlatList
        horizontal
        data={opciones}
        renderItem={({ item }) => (
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={item.valor === 1 ? 'checked' : 'unchecked'}
              onPress={() => {
                const index = profesores.findIndex(p => p.id_usuario === parseInt(profesorSeleccionado));
                handleAsistenciaChange(index, item.campo);
              }}
              color="#6200ee"
            />
            <Text style={styles.checkboxLabel}>{item.label}</Text>
          </View>
        )}
        keyExtractor={(item) => item.campo}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.checkboxGroup}
      />
    );
  };

  if (!isPremium) {
    return (
      <PaperProvider>
        <View style={styles.container}>
          <Text style={styles.error}>
            La toma y modificación de asistencia para profesores no está disponible para tu escuela
          </Text>
        </View>
      </PaperProvider>
    );
  }

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
          {modoModificacion ? 'Modificar Asistencia' : 'Tomar Asistencia'} de Profesores
        </Text>

        {mensaje.text && (
          <Text style={mensaje.type === 'danger' ? styles.error : styles.success}>
            {mensaje.text}
          </Text>
        )}

        {!modoModificacion ? (
          <View style={styles.pickerContainer}>
            <Text>Seleccionar Profesor</Text>
            <Picker
              selectedValue={profesorSeleccionado}
              onValueChange={handleProfesorChange}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione un profesor" value="" />
              {profesores.map((profesor) => (
                <Picker.Item
                  key={profesor.id_usuario}
                  label={`${profesor.nombre} ${profesor.apellido}`}
                  value={profesor.id_usuario}
                />
              ))}
            </Picker>
          </View>
        ) : (
          <>
            <View style={styles.pickerContainer}>
              <Text>Seleccionar Fecha</Text>
              <Picker
                selectedValue={fechaSeleccionada}
                onValueChange={handleFechaChange}
                style={styles.picker}
              >
                <Picker.Item label="Seleccione una fecha" value="" />
                {fechasAsistencias.map((fecha) => (
                  <Picker.Item
                    key={fecha}
                    label={fecha}
                    value={fecha}
                  />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
              <Text>Seleccionar Profesor</Text>
              <Picker
                selectedValue={profesorSeleccionado}
                onValueChange={handleProfesorChange}
                style={styles.picker}
                enabled={!!fechaSeleccionada}
              >
                <Picker.Item label="Seleccione un profesor" value="" />
                {profesores.map((profesor) => (
                  <Picker.Item
                    key={profesor.id_usuario}
                    label={`${profesor.nombre} ${profesor.apellido}`}
                    value={profesor.id_usuario}
                  />
                ))}
              </Picker>
            </View>
          </>
        )}

        {((!modoModificacion && profesorSeleccionado) ||
          (modoModificacion && profesorSeleccionado && fechaSeleccionada)) && (
          <>
            <Text style={styles.subtitulo}>
              {modoModificacion ? 'Modificar Asistencia del Profesor' : 'Registrar Asistencia'}
            </Text>

            <View style={styles.alumnoContainer}>
              <Text style={styles.nombreAlumno}>
                {profesores.find(p => p.id_usuario === parseInt(profesorSeleccionado))?.nombre}{' '}
                {profesores.find(p => p.id_usuario === parseInt(profesorSeleccionado))?.apellido}
              </Text>

              {renderCheckboxes()}
            </View>

            <Button
              mode="contained"
              onPress={modoModificacion ? handleEditarAsistencia : handleSubmit}
              style={styles.boton}
              loading={loading}
              disabled={loading}
            >
              {modoModificacion ? 'Editar Asistencia' : 'Registrar Asistencia'}
            </Button>
          </>
        )}

        {loading && <ActivityIndicator size="large" color="#6200ee" />}
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
    marginHorizontal: 5,
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

export default GestionarAsistenciaProfesor;
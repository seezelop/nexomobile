import React, { useState, useEffect } from 'react';
//import { View, Text, TextInput, Button, FlatList, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import styles from '../../styles';

import { View,  Text, ScrollView, StyleSheet,  TouchableOpacity, ActivityIndicator,SafeAreaView,Alert,Platform
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

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
  const [activeTab, setActiveTab] = useState('tomar'); // 'tomar' or 'modificar'

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
      console.log('INFO QUE VIENE DESDE OBTENER ASISTENCIAS: ' + JSON.stringify(response.data));
    } catch (error) {
      console.error('Error al obtener fechas de asistencias:', error);
      setMensaje({ text: 'Hubo un error al cargar las fechas de asistencias.', type: 'danger' });
    }
  };

  // Obtener asistencias por fecha
  const fetchAsistenciasPorFecha = async (cursoId, idAsistencia) => {
    if (!cursoId || !idAsistencia) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/usuario/obtenerAsistenciasPorFecha/${cursoId}?fecha=${idAsistencia}`,
        { withCredentials: true }
      );

      // Actualizar el estado de asistencia con los datos obtenidos
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
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener asistencias por fecha:', error);
      setMensaje({ text: 'Hubo un error al cargar las asistencias.', type: 'danger' });
      setLoading(false);
    }
  };

  // Manejar el cambio de curso seleccionado (Tomar Asistencia)
  const handleCursoChange = (cursoId) => {
    setCursoSeleccionado(cursoId);
    if (cursoId) {
      fetchAlumnos(cursoId);
    } else {
      setAlumnos([]);
      setAsistencia([]);
    }
  };

  // Manejar el cambio de curso seleccionado (Modificar Asistencia)
  const handleCursoChange2 = async (cursoId) => {
    setCursoSeleccionado(cursoId);
    setAlumnoSeleccionado(''); // Resetear el alumno seleccionado
    setFechaSeleccionada(''); // Resetear la fecha seleccionada
    setIdAsistenciaSeleccionada(''); // Resetear el ID de asistencia

    if (cursoId) {
      await fetchAlumnos(cursoId);
      await fetchFechasAsistencias(cursoId);

      if (idAsistenciaSeleccionada) {
        await fetchAsistenciasPorFecha(cursoId, idAsistenciaSeleccionada);
      }
    } else {
      setAlumnos([]);
      setAsistencia([]);
      setFechasAsistencias([]);
    }
  };

  // Manejar cambios en la asistencia de un alumno
  const handleAsistenciaChange = (index, field, value) => {
    const updatedAsistencia = [...asistencia];

    if (field === 'asistio') {
      updatedAsistencia[index] = {
        ...updatedAsistencia[index],
        asistio: value ? 1 : 0,
        mediaFalta: value ? 0 : updatedAsistencia[index].mediaFalta,
        retiroAntes: value ? 0 : updatedAsistencia[index].retiroAntes,
      };
    } else if (field === 'mediaFalta') {
      updatedAsistencia[index] = {
        ...updatedAsistencia[index],
        mediaFalta: value ? 1 : 0,
        asistio: value ? 0 : updatedAsistencia[index].asistio,
        retiroAntes: value ? 0 : updatedAsistencia[index].retiroAntes,
      };
    } else if (field === 'retiroAntes') {
      updatedAsistencia[index] = {
        ...updatedAsistencia[index],
        retiroAntes: value ? 1 : 0,
        asistio: value ? 0 : updatedAsistencia[index].asistio,
        mediaFalta: value ? 0 : updatedAsistencia[index].mediaFalta,
      };
    }

    setAsistencia(updatedAsistencia);
  };

  // Enviar la asistencia al backend (Tomar Asistencia)
  const handleSubmit = async () => {
    if (!cursoSeleccionado) {
      Alert.alert('Advertencia', 'Debe seleccionar un curso.');
      return;
    }

    if (asistencia.length === 0) {
      Alert.alert('Advertencia', 'No hay alumnos para registrar asistencia.');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        alumnosCurso: asistencia,
      };

      console.log('LO QUE SE VA A ENVIAR:', JSON.stringify(dataToSend, null, 2));

      const response = await axios.post(
        `http://localhost:8080/api/usuario/tomarAsistencia/${cursoSeleccionado}`,
        dataToSend,
        { withCredentials: true }
      );

      if (response.status === 201) {
        Alert.alert('Éxito', 'Asistencia registrada correctamente.');
        setMensaje({ text: 'Asistencia registrada correctamente.', type: 'success' });
      }
    } catch (error) {
      console.error('Error al registrar asistencia:', error);
      Alert.alert(
        'Error', 
        `Error al registrar la asistencia: ${error.response?.data || error.message}`
      );
      setMensaje({
        text: `Error al registrar la asistencia: ${error.response?.data || error.message}`,
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  // Editar la asistencia (Modificar Asistencia)
  const handleEditarAsistencia = async () => {
    if (!cursoSeleccionado || !fechaSeleccionada || !idAsistenciaSeleccionada) {
      Alert.alert('Advertencia', 'Debe seleccionar un curso y una fecha.');
      return;
    }
  
    if (asistencia.length === 0) {
      Alert.alert('Advertencia', 'No hay alumnos para editar asistencia.');
      return;
    }
  
    if (!alumnoSeleccionado) {
      Alert.alert('Advertencia', 'Debe seleccionar un alumno para editar su asistencia.');
      return;
    }
  
    setLoading(true);
    try {
      // Filtrar solo la asistencia del alumno seleccionado
      const alumnoIndex = alumnos.findIndex(alumno => alumno.id_usuario === parseInt(alumnoSeleccionado));
      
      if (alumnoIndex === -1) {
        Alert.alert('Error', 'Alumno no encontrado.');
        setLoading(false);
        return;
      }
      
      const asistenciaAlumno = [asistencia[alumnoIndex]];
      
      console.log('SE VA A ENVIAR: ' + JSON.stringify(asistenciaAlumno));
      console.log('VALOR FECHA A ENVIAR: ' + fechaSeleccionada);
      console.log('ID ASISTENCIA A ENVIAR: ' + idAsistenciaSeleccionada);
      
      const response = await axios.patch(
        `http://localhost:8080/api/usuario/editarAsistencia/${cursoSeleccionado}?fecha=${fechaSeleccionada}`,
        asistenciaAlumno,
        { withCredentials: true }
      );
  
      if (response.status === 200) {
        Alert.alert('Éxito', 'Asistencia editada correctamente.');
        setMensaje({ text: 'Asistencia editada correctamente.', type: 'success' });
      }
    } catch (error) {
      console.error('Error al editar asistencia:', error);
      Alert.alert(
        'Error', 
        `Error al editar la asistencia: ${JSON.stringify(error.response?.data) || error.message}`
      );
      setMensaje({
        text: `Error al editar la asistencia: ${JSON.stringify(error.response?.data) || error.message}`,
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de alumno seleccionado
  const handleAlumnoChange = (itemValue) => {
    setAlumnoSeleccionado(itemValue);
  };

  // Manejar cambio de fecha seleccionada
  const handleFechaChange = (idAsistencia) => {
    setIdAsistenciaSeleccionada(idAsistencia);
    
    // Encontrar la fecha correspondiente al ID de asistencia seleccionado
    const asistenciaSeleccionada = fechasAsistencias.find(a => a.idAsistencia === parseInt(idAsistencia));
    if (asistenciaSeleccionada) {
      setFechaSeleccionada(asistenciaSeleccionada.fecha);
    } else {
      setFechaSeleccionada('');
    }
    
    if (cursoSeleccionado && idAsistencia) {
      fetchAsistenciasPorFecha(cursoSeleccionado, idAsistencia);
    }
  };

  // Obtener el alumno seleccionado para mostrar en la tabla
  const getAlumnoSeleccionadoData = () => {
    if (!alumnoSeleccionado) return null;
    
    const alumnoIndex = alumnos.findIndex(alumno => alumno.id_usuario === parseInt(alumnoSeleccionado));
    if (alumnoIndex === -1) return null;
    
    return {
      alumno: alumnos[alumnoIndex],
      asistencia: asistencia[alumnoIndex],
      index: alumnoIndex
    };
  };

  const renderMensaje = () => {
    if (!mensaje.text) return null;
    
    const backgroundColor = mensaje.type === 'success' ? '#d4edda' : 
                           mensaje.type === 'danger' ? '#f8d7da' : 
                           mensaje.type === 'warning' ? '#fff3cd' : '#cce5ff';
    
    const textColor = mensaje.type === 'success' ? '#155724' : 
                     mensaje.type === 'danger' ? '#721c24' : 
                     mensaje.type === 'warning' ? '#856404' : '#004085';
    
    return (
      <View style={[styles.mensaje, { backgroundColor }]}>
        <Text style={[styles.mensajeText, { color: textColor }]}>{mensaje.text}</Text>
      </View>
    );
  };

  const renderTomarAsistencia = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Seleccionar Curso</Text>
          <Picker
            selectedValue={cursoSeleccionado}
            onValueChange={handleCursoChange}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un curso" value="" />
            {cursos.map((curso) => (
              <Picker.Item 
                key={curso.idCurso} 
                label={curso.numero + curso.division} 
                value={curso.idCurso} 
              />
            ))}
          </Picker>
        </View>

        {alumnos.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Lista de Alumnos</Text>
            <ScrollView horizontal>
              <View>
                <View style={styles.tableHeader}>
                  <View style={[styles.tableHeaderCell, styles.nameColumn]}>
                    <Text style={styles.tableHeaderText}>Alumno</Text>
                  </View>
                  <View style={styles.tableHeaderCell}>
                    <Text style={styles.tableHeaderText}>Presente</Text>
                  </View>
                  <View style={styles.tableHeaderCell}>
                    <Text style={styles.tableHeaderText}>Media Falta</Text>
                  </View>
                  <View style={styles.tableHeaderCell}>
                    <Text style={styles.tableHeaderText}>Retiro Anticipado</Text>
                  </View>
                </View>
                <ScrollView style={styles.tableBody}>
                  {alumnos.map((alumno, index) => (
                    <View key={alumno.id_usuario} style={styles.tableRow}>
                      <View style={[styles.tableCell, styles.nameColumn]}>
                        <Text style={styles.alumnoName}>{alumno.nombre} {alumno.apellido}</Text>
                      </View>
                      <View style={styles.tableCell}>
                        <CheckBox
                          value={asistencia[index]?.asistio === 1}
                          onValueChange={(value) =>
                            handleAsistenciaChange(index, 'asistio', value)
                          }
                          disabled={asistencia[index]?.mediaFalta === 1 || asistencia[index]?.retiroAntes === 1}
                          tintColors={{ true: '#007bff', false: '#6c757d' }}
                        />
                      </View>
                      <View style={styles.tableCell}>
                        <CheckBox
                          value={asistencia[index]?.mediaFalta === 1}
                          onValueChange={(value) =>
                            handleAsistenciaChange(index, 'mediaFalta', value)
                          }
                          disabled={asistencia[index]?.asistio === 1 || asistencia[index]?.retiroAntes === 1}
                          tintColors={{ true: '#ffc107', false: '#6c757d' }}
                        />
                      </View>
                      <View style={styles.tableCell}>
                        <CheckBox
                          value={asistencia[index]?.retiroAntes === 1}
                          onValueChange={(value) =>
                            handleAsistenciaChange(index, 'retiroAntes', value)
                          }
                          disabled={asistencia[index]?.asistio === 1 || asistencia[index]?.mediaFalta === 1}
                          tintColors={{ true: '#dc3545', false: '#6c757d' }}
                        />
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Registrando...' : 'Registrar Asistencia'}
              </Text>
            </TouchableOpacity>
          </>
        ) : cursoSeleccionado ? (
          loading ? (
            <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
          ) : (
            <Text style={styles.emptyMessage}>No hay alumnos registrados en este curso.</Text>
          )
        ) : (
          <Text style={styles.emptyMessage}>Seleccione un curso para ver los alumnos.</Text>
        )}
      </View>
    );
  };

  const renderModificarAsistencia = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Seleccionar Curso</Text>
          <Picker
            selectedValue={cursoSeleccionado}
            onValueChange={handleCursoChange2}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un curso" value="" />
            {cursos.map((curso) => (
              <Picker.Item 
                key={curso.idCurso} 
                label={curso.numero + curso.division} 
                value={curso.idCurso} 
              />
            ))}
          </Picker>
        </View>
        
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Seleccionar Fecha</Text>
          <Picker
            selectedValue={idAsistenciaSeleccionada}
            onValueChange={handleFechaChange}
            style={styles.picker}
            enabled={cursoSeleccionado !== ''}
          >
            <Picker.Item label="Seleccione una fecha" value="" />
            {fechasAsistencias.map((asistencia, index) => (
              <Picker.Item 
                key={index} 
                label={asistencia.fecha} 
                value={asistencia.idAsistencia.toString()} 
              />
            ))}
          </Picker>
        </View>
        
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Seleccionar Alumno</Text>
          <Picker
            selectedValue={alumnoSeleccionado}
            onValueChange={handleAlumnoChange}
            style={styles.picker}
            enabled={cursoSeleccionado !== '' && idAsistenciaSeleccionada !== ''}
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

        {alumnoSeleccionado && alumnos.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Modificar Asistencia del Alumno</Text>
            <ScrollView horizontal>
              <View>
                <View style={styles.tableHeader}>
                  <View style={[styles.tableHeaderCell, styles.nameColumn]}>
                    <Text style={styles.tableHeaderText}>Alumno</Text>
                  </View>
                  <View style={styles.tableHeaderCell}>
                    <Text style={styles.tableHeaderText}>Presente</Text>
                  </View>
                  <View style={styles.tableHeaderCell}>
                    <Text style={styles.tableHeaderText}>Media Falta</Text>
                  </View>
                  <View style={styles.tableHeaderCell}>
                    <Text style={styles.tableHeaderText}>Retiro Anticipado</Text>
                  </View>
                </View>
                <View style={styles.tableBody}>
                  {(() => {
                    const alumnoData = getAlumnoSeleccionadoData();
                    if (!alumnoData) return null;
                    
                    return (
                      <View key={alumnoData.alumno.id_usuario} style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.nameColumn]}>
                          <Text style={styles.alumnoName}>
                            {alumnoData.alumno.nombre} {alumnoData.alumno.apellido}
                          </Text>
                        </View>
                        <View style={styles.tableCell}>
                          <CheckBox
                            value={alumnoData.asistencia?.asistio === 1}
                            onValueChange={(value) =>
                              handleAsistenciaChange(alumnoData.index, 'asistio', value)
                            }
                            disabled={alumnoData.asistencia?.mediaFalta === 1 || alumnoData.asistencia?.retiroAntes === 1}
                            tintColors={{ true: '#007bff', false: '#6c757d' }}
                          />
                        </View>
                        <View style={styles.tableCell}>
                          <CheckBox
                            value={alumnoData.asistencia?.mediaFalta === 1}
                            onValueChange={(value) =>
                              handleAsistenciaChange(alumnoData.index, 'mediaFalta', value)
                            }
                            disabled={alumnoData.asistencia?.asistio === 1 || alumnoData.asistencia?.retiroAntes === 1}
                            tintColors={{ true: '#ffc107', false: '#6c757d' }}
                          />
                        </View>
                        <View style={styles.tableCell}>
                          <CheckBox
                            value={alumnoData.asistencia?.retiroAntes === 1}
                            onValueChange={(value) =>
                              handleAsistenciaChange(alumnoData.index, 'retiroAntes', value)
                            }
                            disabled={alumnoData.asistencia?.asistio === 1 || alumnoData.asistencia?.mediaFalta === 1}
                            tintColors={{ true: '#dc3545', false: '#6c757d' }}
                          />
                        </View>
                      </View>
                    );
                  })()}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.button, styles.warningButton, loading && styles.disabledButton]}
              onPress={handleEditarAsistencia}
              disabled={loading || !fechaSeleccionada || !alumnoSeleccionado}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Editando...' : 'Editar Asistencia'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {renderMensaje()}
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'tomar' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('tomar')}
          >
            <Text style={[
              styles.tabButtonText, 
              activeTab === 'tomar' && styles.activeTabButtonText
            ]}>
              Tomar Asistencia
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'modificar' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('modificar')}
          >
            <Text style={[
              styles.tabButtonText, 
              activeTab === 'modificar' && styles.activeTabButtonText
            ]}>
              Modificar Asistencia
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.card}>
          {activeTab === 'tomar' ? renderTomarAsistencia() : renderModificarAsistencia()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default GestionarAsistenciaAlumnos;
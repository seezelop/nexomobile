import React, { useState, useEffect } from 'react';
import {  
  View,  
  Text,  
  ScrollView,  
  StyleSheet,  
  TouchableOpacity,  
  ActivityIndicator, 
  Alert, 
  Modal
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CheckBox } from 'react-native-elements';
import axios from 'axios';
import { API_BASE_URL } from "../url";

const GestionarAsistenciaProfesor = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState({
    general: false,
    profesores: false,
    asistencias: false,
    guardando: false
  });
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [asistencia, setAsistencia] = useState({});
  const [activeTab, setActiveTab] = useState('tomar');
  const [fechasAsistencias, setFechasAsistencias] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [profesorSeleccionado, setProfesorSeleccionado] = useState('');
  const [planValido, setPlanValido] = useState(null);

  const verificarPlan = async () => {
    setLoading(prev => ({ ...prev, general: true }));
    setError(null);
    
    try {
      //console.log('Verificando plan de la escuela...');
      const response = await axios.get(`${API_BASE_URL}/api/usuario/getPlanEscuela`, { 
        withCredentials: true 
      });
      
      const determinarPlanValido = (data) => {
        if (data === undefined || data === null) return false;
        if (typeof data === 'number') return data === 2;
        if (typeof data === 'string') return data === '2' || data.toLowerCase() === 'premium';
        if (typeof data === 'object') {
          if ('plan' in data) return data.plan === 2;
          if ('codigoPlan' in data) return data.codigoPlan === 2;
          if ('nivelPlan' in data) return data.nivelPlan.toLowerCase() === 'premium';
        }
        return false;
      };
      
      const esPlanValido = determinarPlanValido(response.data);
      console.log('Plan válido:', esPlanValido);
      
      setPlanValido(esPlanValido);
      
      if (!esPlanValido) {
        Alert.alert(
          'Información de Plan', 
          `El plan actual no es Premium. Detalles: ${JSON.stringify(response.data)}`
        );
      }
    } catch (err) {
      //console.error('Error al verificar plan:', err);
      //console.error('Detalles del error:', err.response?.data || err.message);
      
      let errorMessage = 'Error al verificar el plan de la escuela';
      if (err.response) {
        errorMessage += `: ${err.response.status} - ${JSON.stringify(err.response.data)}`;
      } else {
        errorMessage += `: ${err.message}`;
      }
      
      setError(errorMessage);
      setPlanValido(false);
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, general: false }));
    }
  };

  // Verificar el plan al cargar el componente
  useEffect(() => {
    verificarPlan();
  }, []);

  // Cargar datos si el plan es válido
  useEffect(() => {
    if (planValido === true) {
      obtenerProfesores();
      if (activeTab === 'modificar') {
        obtenerFechasAsistencias();
      }
    }
  }, [planValido, activeTab]);

  const obtenerProfesores = async () => {
    setLoading(prev => ({ ...prev, profesores: true }));
    setError(null);
    
    try {
      //console.log('Obteniendo lista de profesores...');
      const response = await axios.get(`${API_BASE_URL}/api/usuario/verProfesAdministrativo`, { 
        withCredentials: true 
      });
      
      //console.log('Profesores obtenidos:', response.data.length);
      setProfesores(response.data);
      
      // Inicializar asistencia para cada profesor
      const asistenciaInicial = response.data.reduce((acc, profe) => {
        acc[profe.id_usuario] = { asistio: 0, mediaFalta: 0, retiroAntes: 0 };
        return acc;
      }, {});
      setAsistencia(asistenciaInicial);
    } catch (err) {
      console.error('Error al obtener profesores:', err);
      const errorMsg = 'Error al cargar los profesores: ' + (err.response?.data?.message || err.message);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, profesores: false }));
    }
  };

  const obtenerFechasAsistencias = async () => {
    setLoading(prev => ({ ...prev, asistencias: true }));
    setError(null);
    
    try {
     // console.log('Obteniendo fechas de asistencias...');
      const response = await axios.get(`${API_BASE_URL}/api/usuario/obtenerAsistenciaProfe`, { 
        withCredentials: true 
      });
      
      //console.log('Fechas obtenidas:', response.data.length);
      setFechasAsistencias(response.data);
    } catch (err) {
      console.error('Error al obtener fechas:', err);
      if (err.response?.status === 204) {
        setFechasAsistencias([]);
        Alert.alert('Información', 'No hay registros de asistencia disponibles');
      } else {
        const errorMsg = 'Error al cargar las fechas: ' + (err.response?.data?.message || err.message);
        setError(errorMsg);
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setLoading(prev => ({ ...prev, asistencias: false }));
    }
  };

  const obtenerAsistenciasPorFecha = async (fecha) => {
    setLoading(prev => ({ ...prev, asistencias: true }));
    setError(null);
    
    try {
      //console.log(`Obteniendo asistencias para fecha: ${fecha}`);
      
      // Reiniciar asistencia a ceros
      const asistenciaInicial = profesores.reduce((acc, profe) => {
        acc[profe.id_usuario] = { asistio: 0, mediaFalta: 0, retiroAntes: 0 };
        return acc;
      }, {});
      
      // Buscar en fechasAsistencias los registros para esta fecha
      const asistenciasFecha = fechasAsistencias.find(a => a.fecha === fecha);
      
      if (asistenciasFecha && asistenciasFecha.asistencias) {
        //console.log(`Encontradas ${asistenciasFecha.asistencias.length} asistencias para ${fecha}`);
        
        // Actualizar el estado con los datos obtenidos
        asistenciasFecha.asistencias.forEach(registro => {
          if (asistenciaInicial[registro.idUsuario]) {
            asistenciaInicial[registro.idUsuario] = {
              asistio: registro.asistio,
              mediaFalta: registro.mediaFalta,
              retiroAntes: registro.retiroAntes
            };
          }
        });
      }
      
      setAsistencia(asistenciaInicial);
    } catch (err) {
      //console.error('Error al obtener asistencias:', err);
      const errorMsg = 'Error al obtener asistencias: ' + (err.response?.data?.message || err.message);
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, asistencias: false }));
    }
  };

  const handleCheckboxChange = (id_usuario, campo) => {
    setAsistencia((prev) => {
      const nuevoEstado = { 
        asistio: 0, 
        mediaFalta: 0, 
        retiroAntes: 0 
      };
      
      // Solo marcar el campo seleccionado y desmarcar los otros
      nuevoEstado[campo] = prev[id_usuario][campo] === 1 ? 0 : 1;
      
      return { 
        ...prev, 
        [id_usuario]: nuevoEstado 
      };
    });
  };

  const enviarAsistencia = async () => {
    setLoading(prev => ({ ...prev, guardando: true }));
    setMensaje('');
    setError(null);
    
    try {
      //console.log('Preparando datos de asistencia...');
      
      const data = {
        alumnosCurso: Object.keys(asistencia).map((id_usuario) => ({
          idUsuario: parseInt(id_usuario),  
          asistio: asistencia[id_usuario].asistio,
          mediaFalta: asistencia[id_usuario].mediaFalta,
          retiroAntes: asistencia[id_usuario].retiroAntes,
        })),
      };
      
     // console.log('Enviando datos:', data);
      
      await axios.post(`${API_BASE_URL}/api/usuario/tomarAsistenciaProfesor`, data, { 
        withCredentials: true 
      });

      const successMsg = 'Asistencia registrada correctamente';
      console.log(successMsg);
      setMensaje(successMsg);
      Alert.alert('Éxito', successMsg);
      
      if (activeTab === 'modificar') {
        obtenerFechasAsistencias();
      }
      
      const asistenciaInicial = profesores.reduce((acc, profe) => {
        acc[profe.id_usuario] = { asistio: 0, mediaFalta: 0, retiroAntes: 0 };
        return acc;
      }, {});
      setAsistencia(asistenciaInicial);
    } catch (err) {
      console.error('Error al registrar asistencia:', err);
      const errorMsg = 'Error al registrar: ' + (err.response?.data?.message || err.message);
      setMensaje(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, guardando: false }));
    }
  };

  const editarAsistencia = async () => {
    if (!fechaSeleccionada) {
      Alert.alert('Error', 'Por favor, seleccione una fecha');
      return;
    }

    if (!profesorSeleccionado) {
      Alert.alert('Error', 'Por favor, seleccione un profesor');
      return;
    }

    setLoading(prev => ({ ...prev, guardando: true }));
    setMensaje('');
    setError(null);
    
    try {
     // console.log(`Editando asistencia para profesor ${profesorSeleccionado} en fecha ${fechaSeleccionada}`);
      
      // Solo enviar la asistencia del profesor seleccionado
      const dataToSend = [{
        idUsuario: parseInt(profesorSeleccionado),
        asistio: asistencia[profesorSeleccionado].asistio,
        mediaFalta: asistencia[profesorSeleccionado].mediaFalta,
        retiroAntes: asistencia[profesorSeleccionado].retiroAntes,
      }];
      
     // console.log('Datos a enviar:', dataToSend);
      
      await axios.patch(
        `${API_BASE_URL}/api/usuario/editarAsistenciaProfe?fecha=${fechaSeleccionada}`, 
        dataToSend, 
        { withCredentials: true }
      );

      const successMsg = 'Asistencia editada correctamente';
      //console.log(successMsg);
      setMensaje(successMsg);
      Alert.alert('Éxito', successMsg);
      
      // Actualizar la lista de fechas
      obtenerFechasAsistencias();
    } catch (err) {
      console.error('Error al editar asistencia:', err);
      const errorMsg = 'Error al editar: ' + (err.response?.data?.message || err.message);
      setMensaje(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, guardando: false }));
    }
  };

  const handleFechaChange = (fecha) => {
    console.log('Fecha seleccionada:', fecha);
    setFechaSeleccionada(fecha);
    if (fecha) {
      obtenerAsistenciasPorFecha(fecha);
    }
  };

  const handleProfesorChange = (profesor) => {
   // console.log('Profesor seleccionado:', profesor);
    setProfesorSeleccionado(profesor);
  };

  const toggleTab = (tab) => {
    //console.log('Cambiando a pestaña:', tab);
    setActiveTab(tab);
    setMensaje('');
    setError(null);
    
    if (tab === 'modificar') {
      obtenerFechasAsistencias();
    }
  };

  const getProfesorSeleccionadoData = () => {
    if (!profesorSeleccionado) return null;
    
    const profesor = profesores.find(p => p.id_usuario === parseInt(profesorSeleccionado));
    if (!profesor) return null;
    
    return {
      profesor,
      asistencia: asistencia[profesor.id_usuario]
    };
  };

  if (planValido === null) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Verificando permisos...</Text>
      </View>
    );
  }

  if (planValido === false) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Acceso restringido</Text>
        <Text style={styles.errorText}>
          Su plan escolar no incluye la funcionalidad de gestión de asistencia de profesores.
        </Text>
        <Text style={styles.errorText}>
          Por favor, actualice a un plan Premium para acceder a esta característica.
        </Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={verificarPlan}
        >
          <Text style={styles.buttonText}>Reintentar verificación</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Gestión de Asistencia de Profesores</Text>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'tomar' ? styles.activeTab : styles.inactiveTab
          ]}
          onPress={() => toggleTab('tomar')}
          disabled={loading.general}
        >
          <Text style={styles.tabButtonText}>Tomar Asistencia</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'modificar' ? styles.activeTab : styles.inactiveTab
          ]}
          onPress={() => toggleTab('modificar')}
          disabled={loading.general}
        >
          <Text style={styles.tabButtonText}>Modificar Asistencia</Text>
        </TouchableOpacity>
      </View>

      {loading.general && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Cargando datos...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorMessageContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {mensaje ? (
        <View style={[
          styles.messageContainer,
          mensaje.includes('Error') ? styles.errorMessage : styles.successMessage
        ]}>
          <Text style={mensaje.includes('Error') ? styles.errorText : styles.successText}>
            {mensaje}
          </Text>
        </View>
      ) : null}

      {activeTab === 'tomar' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tomar Asistencia</Text>
          
          {loading.profesores ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : profesores.length > 0 ? (
            profesores.map((profesor) => (
              <View key={profesor.id_usuario} style={styles.attendanceRow}>
                <Text style={styles.profesorName}>
                  {profesor.nombreCompleto || `${profesor.nombre} ${profesor.apellido}`}
                </Text>
                <View style={styles.checkboxContainer}>
                  <CheckBox
                    title="Asistió"
                    checked={asistencia[profesor.id_usuario]?.asistio === 1}
                    onPress={() => handleCheckboxChange(profesor.id_usuario, 'asistio')}
                    disabled={
                      asistencia[profesor.id_usuario]?.mediaFalta === 1 || 
                      asistencia[profesor.id_usuario]?.retiroAntes === 1 ||
                      loading.guardando
                    }
                    containerStyle={styles.checkbox}
                  />
                  <CheckBox
                    title="Media Falta"
                    checked={asistencia[profesor.id_usuario]?.mediaFalta === 1}
                    onPress={() => handleCheckboxChange(profesor.id_usuario, 'mediaFalta')}
                    disabled={
                      asistencia[profesor.id_usuario]?.asistio === 1 || 
                      asistencia[profesor.id_usuario]?.retiroAntes === 1 ||
                      loading.guardando
                    }
                    containerStyle={styles.checkbox}
                  />
                  <CheckBox
                    title="Retiro Antes"
                    checked={asistencia[profesor.id_usuario]?.retiroAntes === 1}
                    onPress={() => handleCheckboxChange(profesor.id_usuario, 'retiroAntes')}
                    disabled={
                      asistencia[profesor.id_usuario]?.asistio === 1 || 
                      asistencia[profesor.id_usuario]?.mediaFalta === 1 ||
                      loading.guardando
                    }
                    containerStyle={styles.checkbox}
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.warningText}>No hay profesores disponibles</Text>
          )}

          <TouchableOpacity 
            style={[
              styles.button, 
              (loading.guardando || profesores.length === 0) && styles.disabledButton
            ]}
            onPress={enviarAsistencia}
            disabled={loading.guardando || profesores.length === 0}
          >
            {loading.guardando ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Registrar Asistencia</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'modificar' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Modificar Asistencia</Text>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Seleccionar Fecha</Text>
            <Picker
              selectedValue={fechaSeleccionada}
              onValueChange={handleFechaChange}
              enabled={!loading.asistencias && fechasAsistencias.length > 0}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una fecha" value="" />
              {fechasAsistencias.map((asistencia, index) => (
                <Picker.Item 
                  key={index} 
                  label={asistencia.fecha} 
                  value={asistencia.fecha} 
                />
              ))}
            </Picker>

            <Text style={styles.pickerLabel}>Seleccionar Profesor</Text>
            <Picker
              selectedValue={profesorSeleccionado}
              onValueChange={handleProfesorChange}
              enabled={!!fechaSeleccionada && !loading.asistencias && profesores.length > 0}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione un profesor" value="" />
              {profesores.map((profesor) => (
                <Picker.Item 
                  key={profesor.id_usuario} 
                  label={profesor.nombreCompleto || `${profesor.nombre} ${profesor.apellido}`} 
                  value={profesor.id_usuario.toString()} 
                />
              ))}
            </Picker>
          </View>

          {fechaSeleccionada && profesorSeleccionado && (
            <View>
              {(() => {
                const profesorData = getProfesorSeleccionadoData();
                if (!profesorData) return null;
                
                return (
                  <View style={styles.attendanceRow}>
                    <Text style={styles.profesorName}>
                      {profesorData.profesor.nombreCompleto || 
                        `${profesorData.profesor.nombre} ${profesorData.profesor.apellido}`}
                    </Text>
                    <View style={styles.checkboxContainer}>
                      <CheckBox
                        title="Presente"
                        checked={profesorData.asistencia?.asistio === 1}
                        onPress={() => handleCheckboxChange(profesorData.profesor.id_usuario, 'asistio')}
                        disabled={
                          profesorData.asistencia?.mediaFalta === 1 || 
                          profesorData.asistencia?.retiroAntes === 1 ||
                          loading.guardando
                        }
                        containerStyle={styles.checkbox}
                      />
                      <CheckBox
                        title="Media Falta"
                        checked={profesorData.asistencia?.mediaFalta === 1}
                        onPress={() => handleCheckboxChange(profesorData.profesor.id_usuario, 'mediaFalta')}
                        disabled={
                          profesorData.asistencia?.asistio === 1 || 
                          profesorData.asistencia?.retiroAntes === 1 ||
                          loading.guardando
                        }
                        containerStyle={styles.checkbox}
                      />
                      <CheckBox
                        title="Retiro Anticipado"
                        checked={profesorData.asistencia?.retiroAntes === 1}
                        onPress={() => handleCheckboxChange(profesorData.profesor.id_usuario, 'retiroAntes')}
                        disabled={
                          profesorData.asistencia?.asistio === 1 || 
                          profesorData.asistencia?.mediaFalta === 1 ||
                          loading.guardando
                        }
                        containerStyle={styles.checkbox}
                      />
                    </View>
                  </View>
                );
              })()}

              <TouchableOpacity 
                style={[
                  styles.button, 
                  (loading.guardando || !fechaSeleccionada || !profesorSeleccionado) && styles.disabledButton
                ]}
                onPress={editarAsistencia}
                disabled={loading.guardando || !fechaSeleccionada || !profesorSeleccionado}
              >
                {loading.guardando ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Editar Asistencia</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollContent: {
    padding: 15,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffebee'
  },
  errorMessageContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10
  },
  messageContainer: {
    padding: 15,
    borderRadius: 5,
    marginVertical: 10
  },
  errorMessage: {
    backgroundColor: '#ffebee'
  },
  successMessage: {
    backgroundColor: '#e8f5e9'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#333'
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden'
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    alignItems: 'center'
  },
  activeTab: {
    backgroundColor: '#007bff'
  },
  inactiveTab: {
    backgroundColor: '#b0bec5'
  },
  tabButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#007bff'
  },
  attendanceRow: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10
  },
  profesorName: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500'
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap'
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0
  },
  pickerContainer: {
    marginBottom: 15
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#333'
  },
  picker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginBottom: 15
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.7
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center'
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 5
  },
  successText: {
    color: '#388e3c',
    textAlign: 'center',
    marginBottom: 10
  },
  warningText: {
    color: '#ffa000',
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 16
  }
});

export default GestionarAsistenciaProfesor;
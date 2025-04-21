import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { API_BASE_URL } from "../url";

// Crear una instancia de axios con la URL base y cookies
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const ModificarEvento = () => {
  // Estados
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(new Date());
  const [respuesta, setRespuesta] = useState('');
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState("");
  
  // Estados UI
  const [loading, setLoading] = useState({
    cursos: false,
    eventos: false,
    envio: false
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');

  // Cargar cursos al iniciar
  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    setLoading(prev => ({ ...prev, cursos: true }));
    try {
      const response = await api.get("/api/usuario/verCursoProfesor");
      setCursos(response.data);
    } catch (error) {
      console.error("Error al cargar los cursos:", error);
      Alert.alert("Error", "No se pudieron cargar los cursos");
    } finally {
      setLoading(prev => ({ ...prev, cursos: false }));
    }
  };

  const cargarEventos = async (cursoId) => {
    if (!cursoId) return;
    
    setLoading(prev => ({ ...prev, eventos: true }));
    try {
      const response = await api.get(`/api/usuario/verEventos/${cursoId}`);
      setEventos(response.data);
    } catch (error) {
      console.error("Error al cargar los eventos:", error);
      Alert.alert("Error", "No se pudieron cargar los eventos");
    } finally {
      setLoading(prev => ({ ...prev, eventos: false }));
    }
  };

  // Manejar cambio de curso y cargar sus eventos
  const handleCursoChange = (cursoId) => {
    setCursoSeleccionado(cursoId);
    setEventoSeleccionado(""); // Resetear evento seleccionado
    
    if (cursoId) {
      cargarEventos(cursoId);
    } else {
      setEventos([]);
    }
  };

  // Cargar datos del evento seleccionado
  useEffect(() => {
    if (eventoSeleccionado) {
      const eventoActual = eventos.find(e => e.idEvento.toString() === eventoSeleccionado);
      if (eventoActual) {
        setDescripcion(eventoActual.descripcion);
        
        // Convertir fecha string a Date
        try {
          setFecha(new Date(eventoActual.fecha));
        } catch (error) {
          console.error("Error convirtiendo fecha:", error);
          setFecha(new Date());
        }
      }
    }
  }, [eventoSeleccionado, eventos]);

  // Funciones para el DateTimePicker
  const mostrarDateTimePicker = () => {
    if (Platform.OS === 'android') {
      setPickerMode('date');
    } else {
      setPickerMode('datetime');
    }
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    // En Android "cancel" devuelve tipo undefined
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    
    setShowDatePicker(false);
    
    if (selectedDate) {
      setFecha(selectedDate);
      
      // Para Android: después de seleccionar fecha, mostrar selector de hora
      if (Platform.OS === 'android' && pickerMode === 'date') {
        setTimeout(() => {
          setPickerMode('time');
          setShowDatePicker(true);
        }, 100);
      }
    }
  };

  // Formatear fecha para mostrar en UI
  const formatearFechaParaMostrar = (date) => {
    if (!date) return "Sin fecha seleccionada";
    
    try {
      return date.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', '');
    } catch (e) {
      console.error("Error formateando fecha:", e);
      return "Fecha inválida";
    }
  };

const formatDateForBackend = (date) => {
  if (!date) return null;
  
  try {
    const validDate = new Date(date);
    
    // Verificar que sea una fecha válida
    if (isNaN(validDate.getTime())) {
      console.error("Fecha inválida");
      return null;
    }
    
    const year = validDate.getFullYear();
    const month = String(validDate.getMonth() + 1).padStart(2, '0');
    const day = String(validDate.getDate()).padStart(2, '0');
    const hours = String(validDate.getHours()).padStart(2, '0');
    const minutes = String(validDate.getMinutes()).padStart(2, '0');
    const seconds = String(validDate.getSeconds()).padStart(2, '0');
    
    // Formato YYYY-MM-DD HH:MM:SS
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    console.error("Error formateando fecha para backend:", e);
    return null;
  }
};

  // Validación de formulario
  const validarFormulario = () => {
    if (!eventoSeleccionado) {
      Alert.alert('Error', 'Debe seleccionar un evento');
      return false;
    }
    return true;
  };

  // Envío de formulario
  const manejarEnvio = async () => {
    if (!validarFormulario()) return;
    
    setLoading(prev => ({ ...prev, envio: true }));
    
    // Construir payload con solo los campos necesarios
    const eventoData = {
      idEvento: parseInt(eventoSeleccionado),
    };
    
    // Solo agregar descripción si se modificó
    if (descripcion.trim() !== '') {
      eventoData.descripcion = descripcion;
    }
    
    // Solo agregar fecha si es válida
    const formattedFecha = formatDateForBackend(fecha);
    if (formattedFecha) {
      eventoData.fecha = formattedFecha;
    }
    
    try {
      const response = await api.patch(
        "/api/usuario/modificarEvento",
        eventoData,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.status === 200) {
        setRespuesta('Evento editado exitosamente.');
        Alert.alert("Éxito", "Evento modificado correctamente");
        
        // Recargar eventos para ver cambios
        if (cursoSeleccionado) {
          cargarEventos(cursoSeleccionado);
        }
      }
    } catch (error) {
      console.error("Error completo:", error);
      const mensajeError = error.response?.data?.message || 
                         typeof error.response?.data === "string" ? 
                         error.response.data : "Error al modificar el evento";
      
      setRespuesta(mensajeError);
      Alert.alert("Error", mensajeError);
    } finally {
      setLoading(prev => ({ ...prev, envio: false }));
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Selector de Curso */}
      <View style={styles.section}>
        <Text style={styles.label}>Curso:</Text>
        {loading.cursos ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={cursoSeleccionado}
              onValueChange={handleCursoChange}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione un curso" value="" />
              {cursos.map((curso) => (
                <Picker.Item 
                  key={curso.idCurso} 
                  label={`${curso.numero} ${curso.division}`} 
                  value={curso.idCurso.toString()} 
                />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* Selector de Evento */}
      <View style={styles.section}>
        <Text style={styles.label}>Evento:</Text>
        {loading.eventos ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={eventoSeleccionado}
              onValueChange={(value) => setEventoSeleccionado(value)}
              enabled={cursoSeleccionado !== ""}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione un evento" value="" />
              {eventos.map((evento) => (
                <Picker.Item 
                  key={evento.idEvento} 
                  label={evento.descripcion} 
                  value={evento.idEvento.toString()} 
                />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* Descripción */}
      <View style={styles.section}>
        <Text style={styles.label}>Descripción:</Text>
        <TextInput
          style={styles.input}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Deje en blanco para mantener la descripción actual"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Selector de Fecha */}
      <View style={styles.section}>
        <Text style={styles.label}>Fecha y Hora:</Text>
        <TouchableOpacity 
          onPress={mostrarDateTimePicker} 
          style={styles.dateButton}
        >
          <Text style={styles.dateButtonText}>
            {formatearFechaParaMostrar(fecha)}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={fecha}
            mode={pickerMode}
            is24Hour={true}
            display={Platform.OS === 'android' ? 'default' : 'spinner'}
            onChange={handleDateChange}
          />
        )}
      </View>

      {/* Botón de Envío */}
      <TouchableOpacity 
        style={[
          styles.submitButton,
          (loading.envio || !eventoSeleccionado) && styles.submitButtonDisabled
        ]}
        onPress={manejarEnvio}
        disabled={loading.envio || !eventoSeleccionado}
      >
        <Text style={styles.submitButtonText}>
          {loading.envio ? "Procesando..." : "Modificar Evento"}
        </Text>
      </TouchableOpacity>

      {/* Mensaje de respuesta */}
      {respuesta ? (
        <View style={styles.alertContainer}>
          <Text style={styles.alertText}>{respuesta}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 5,
  },
  picker: {
    height: 50,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    backgroundColor: 'white',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  alertContainer: {
    backgroundColor: '#d4edff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  alertText: {
    fontSize: 16,
    color: '#333',
  }
});

export default ModificarEvento;
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  Platform, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { API_BASE_URL } from "../url";

const ModificarEvento = () => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    descripcion: '',
    fecha: new Date(),
    cursoId: '',
    eventoId: ''
  });
  
  // Estados para UI y carga
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [cursos, setCursos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState({
    cursos: false,
    eventos: false,
    envio: false
  });

  // Cargar cursos al montar el componente
  useEffect(() => {
    const cargarCursos = async () => {
      setLoading(prev => ({ ...prev, cursos: true }));
      try {
        const response = await axios.get(`${API_BASE_URL}/api/usuario/verCursoProfesor`, {
          withCredentials: true,
        });
        setCursos(response.data);
      } catch (error) {
        handleError('No se pudieron cargar los cursos', error);
      } finally {
        setLoading(prev => ({ ...prev, cursos: false }));
      }
    };

    cargarCursos();
  }, []);

  // Cargar eventos cuando se selecciona un curso
  useEffect(() => {
    if (formData.cursoId) {
      cargarEventos(formData.cursoId);
    } else {
      setEventos([]);
      setFormData(prev => ({ ...prev, eventoId: '' }));
    }
  }, [formData.cursoId]);

  const cargarEventos = async (cursoId) => {
    setLoading(prev => ({ ...prev, eventos: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/api/usuario/verEventos/${cursoId}`, {
        withCredentials: true,
      });
      setEventos(response.data);
    } catch (error) {
      handleError('No se pudieron cargar los eventos', error);
    } finally {
      setLoading(prev => ({ ...prev, eventos: false }));
    }
  };

  // Cargar datos del evento seleccionado
  useEffect(() => {
    if (formData.eventoId) {
      const evento = eventos.find(e => e.idEvento.toString() === formData.eventoId);
      if (evento) {
        setFormData(prev => ({
          ...prev,
          descripcion: evento.descripcion,
          fecha: new Date(evento.fecha)
        }));
      }
    }
  }, [formData.eventoId]);

  const handleError = (message, error) => {
    console.error(message, error);
    Alert.alert('Error', error.response?.data?.message || message);
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Función para formatear fecha al formato que espera el backend
  const formatDateForBackend = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;  
  };

 
  const mostrarDateTimePicker = () => {
    if (Platform.OS === 'android') {
      setPickerMode('date');
    } else {
      setPickerMode('datetime');
    }
    setShowPicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    
    if (event.type === 'set' && selectedDate) {
      const currentDate = selectedDate || formData.fecha;
      setFormData(prev => ({ ...prev, fecha: currentDate }));

      // Para Android: después de seleccionar fecha, mostrar selector de hora
      if (Platform.OS === 'android' && pickerMode === 'date') {
        setTimeout(() => {
          setPickerMode('time');
          setShowPicker(true);
        }, 100);
      }
    }
  };

  const formatearFechaParaMostrar = (date) => {
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

  const validarFormulario = () => {
    if (!formData.eventoId) {
      Alert.alert('Error', 'Debe seleccionar un evento');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    setLoading(prev => ({ ...prev, envio: true }));

    const payload = {
      idEvento: parseInt(formData.eventoId),
      ...(formData.descripcion && { descripcion: formData.descripcion }),
      fecha: formatDateForBackend(formData.fecha),
    };

    try {
      await axios.patch(
        `${API_BASE_URL}/api/usuario/modificarEvento`,
        payload,
        {
          withCredentials: true,
          headers: { 
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert('Éxito', 'Evento modificado correctamente');
      // Recargar eventos si hay un curso seleccionado
      if (formData.cursoId) {
        cargarEventos(formData.cursoId);
      }
    } catch (error) {
      handleError('Error al modificar el evento', error);
    } finally {
      setLoading(prev => ({ ...prev, envio: false }));
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Selector de Curso */}
      <View style={styles.section}>
        <Text style={styles.label}>Curso:</Text>
        {loading.cursos ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Picker
            selectedValue={formData.cursoId}
            onValueChange={(value) => handleChange('cursoId', value)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un curso" value="" />
            {cursos.map((curso) => (
              <Picker.Item 
                key={curso.idCurso} 
                label={`${curso.numero} ${curso.division}`} 
                value={curso.idCurso} 
              />
            ))}
          </Picker>
        )}
      </View>

      {/* Selector de Evento */}
      <View style={styles.section}>
        <Text style={styles.label}>Evento:</Text>
        {loading.eventos ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Picker
            selectedValue={formData.eventoId}
            onValueChange={(value) => handleChange('eventoId', value)}
            enabled={!!formData.cursoId}
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
        )}
      </View>

      {/* Descripción */}
      <View style={styles.section}>
        <Text style={styles.label}>Descripción:</Text>
        <TextInput
          style={styles.input}
          value={formData.descripcion}
          onChangeText={(text) => handleChange('descripcion', text)}
          placeholder="Deje en blanco para mantener la descripción actual"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Selector de Fecha y Hora */}
      <View style={styles.section}>
        <Text style={styles.label}>Fecha y Hora:</Text>
        <TouchableOpacity 
          onPress={mostrarDateTimePicker} 
          style={styles.dateButton}
        >
          <Text>{formatearFechaParaMostrar(formData.fecha)}</Text>
        </TouchableOpacity>
        
        {showPicker && (
          <DateTimePicker
            value={formData.fecha}
            mode={pickerMode}
            is24Hour={true}
            display={Platform.OS === 'android' ? 'default' : 'spinner'}
            onChange={handleDateChange}
            minimumDate={new Date()}
            {...(Platform.OS === 'android' && {
              positiveButtonLabel: 'Seleccionar',
              negativeButtonLabel: 'Cancelar'
            })}
          />
        )}
      </View>

      {/* Botón de Envío */}
      <View style={styles.section}>
        <Button 
          title={loading.envio ? "Procesando..." : "Modificar Evento"} 
          onPress={handleSubmit} 
          disabled={loading.envio || !formData.eventoId}
          color="#4a90e2"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    minHeight: 50,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
  },
});

export default ModificarEvento;
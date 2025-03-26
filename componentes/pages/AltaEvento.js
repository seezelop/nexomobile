import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { API_BASE_URL } from "../url";

const AltaEvento = () => {
  // Estados del formulario
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorDescripcion, setErrorDescripcion] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');

  // Cargar cursos al montar el componente
  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    setCargando(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/usuario/verCursoProfesor`, {
        withCredentials: true
      });
      setCursos(response.data);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      Alert.alert('Error', 'No se pudieron cargar los cursos');
    } finally {
      setCargando(false);
    }
  };

  // Validación de la descripción
  const validarDescripcion = (texto) => {
    const caracteresRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.-]*$/;
    
    if (texto.length < 4) {
      setErrorDescripcion("La descripción debe tener al menos 4 caracteres.");
    } else if (texto.length > 80) {
      setErrorDescripcion("La descripción no puede exceder 80 caracteres.");
    } else if (!caracteresRegex.test(texto)) {
      setErrorDescripcion("Solo letras, números, espacios y guiones.");
    } else {
      setErrorDescripcion(null);
    }

    setDescripcion(texto);
  };

  // Manejo del selector de fecha/hora
  const mostrarSelector = (mode) => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const manejarCambioFechaHora = (event, selectedDate) => {
    setShowPicker(false);
    
    if (selectedDate) {
      const currentDate = selectedDate || fecha;
      setFecha(currentDate);

      // Para Android: mostrar selector de hora después de fecha
      if (Platform.OS === 'android' && pickerMode === 'date') {
        setTimeout(() => {
          setPickerMode('time');
          setShowPicker(true);
        }, 100);
      }
    }
  };

  // Función principal para enviar el evento
  const crearEvento = async () => {
    // Validaciones
    if (!descripcion.trim()) {
      Alert.alert('Error', 'La descripción no puede estar vacía');
      return;
    }

    if (errorDescripcion) {
      Alert.alert('Error', errorDescripcion);
      return;
    }

    if (!cursoSeleccionado) {
      Alert.alert('Error', 'Debe seleccionar un curso');
      return;
    }

    try {
      setCargando(true);
      
      // Formatear fecha para el backend
      const fechaFormateada = `${String(fecha.getDate()).padStart(2, '0')}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${fecha.getFullYear()} ${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
      
      // Enviar datos al backend
      const response = await axios.post(
        `${API_BASE_URL}/api/usuario/altaEvento/${cursoSeleccionado}`,
        {
          cursoSeleccionado,
          descripcion,
          fecha: fechaFormateada,
        },
        { withCredentials: true }
      );

      // Éxito
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Éxito', 'Evento creado correctamente');
        // Resetear formulario
        setDescripcion('');
        setFecha(new Date());
        setCursoSeleccionado('');
      }
    } catch (error) {
      console.error('Error al crear evento:', error);
      Alert.alert('Error', error.response?.data?.message || 'Error al crear el evento');
    } finally {
      setCargando(false);
    }
  };

  // Formatear fecha para mostrar
  const formatDateForDisplay = (date) => {
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Selector de Curso */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Curso</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={cursoSeleccionado}
            onValueChange={setCursoSeleccionado}
            enabled={!cargando}
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
      </View>

      {/* Campo Descripción */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Descripción</Text>
        <View style={styles.descriptionContainer}>
          <TextInput
            style={[
              styles.textArea, 
              errorDescripcion ? styles.inputError : null
            ]}
            value={descripcion}
            onChangeText={validarDescripcion}
            multiline
            placeholder="Descripción del evento (4-80 caracteres)"
            maxLength={80}
            editable={!cargando}
          />
          <Text style={styles.characterCount}>
            {descripcion.length}/80
          </Text>
        </View>
        {errorDescripcion && (
          <Text style={styles.errorText}>{errorDescripcion}</Text>
        )}
      </View>

      {/* Selector Fecha/Hora */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Fecha y Hora</Text>
        <TouchableOpacity 
          onPress={() => mostrarSelector('date')} 
          style={styles.dateInput}
          disabled={cargando}
        >
          <Text>{formatDateForDisplay(fecha)}</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={fecha}
            mode={pickerMode}
            display="default"
            onChange={manejarCambioFechaHora}
          />
        )}
      </View>

      {/* Botón de Envío */}
      <TouchableOpacity 
        style={[
          styles.submitButton, 
          cargando && styles.disabledButton
        ]} 
        onPress={crearEvento}
        disabled={cargando}
        activeOpacity={0.7}
      >
        <Text style={styles.submitButtonText}>
          {cargando ? 'Creando Evento...' : 'Crear Evento'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Estilos optimizados
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 25,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    minHeight: 120,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  descriptionContainer: {
    position: 'relative',
  },
  characterCount: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    color: '#7f8c8d',
    fontSize: 12,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    height: 50,
  },
  submitButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    marginTop: 6,
  },
});

export default AltaEvento;
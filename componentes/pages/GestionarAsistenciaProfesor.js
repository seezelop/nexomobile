import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import styles from '../../styles';

const GestionarAsistenciaProfesor = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [asistencia, setAsistencia] = useState({});
  const [activeTab, setActiveTab] = useState('tomar'); 
  const [fechasAsistencias, setFechasAsistencias] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [profesorSeleccionado, setProfesorSeleccionado] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    obtenerProfesores();
    obtenerPlanUsuario();
    if (activeTab === 'modificar') {
      obtenerFechasAsistencias();
    }
  }, [activeTab]);

  const obtenerProfesores = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/usuario/verProfesAdministrativo', { withCredentials: true });
      setProfesores(response.data);

      const asistenciaInicial = response.data.reduce((acc, profe) => {
        acc[profe.id_usuario] = { asistio: 0, mediaFalta: 0, retiroAntes: 0 };
        return acc;
      }, {});
      setAsistencia(asistenciaInicial);
    } catch (err) {
      setError('Error al cargar los profesores: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const obtenerPlanUsuario = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/usuario/getPlanEscuela', { withCredentials: true });
      if (response.data === 2) {
        setIsPremium(true);
      }
    } catch (err) {
      setError('Error al cargar el plan del usuario: ' + (err.response?.data || err.message));
    }
  };

  const obtenerFechasAsistencias = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/usuario/obtenerAsistenciasProfe', {
        withCredentials: true
      });
      setFechasAsistencias(response.data);
    } catch (err) {
      if (err.response?.status === 204) {
        setFechasAsistencias([]);
      } else {
        setError('Error al cargar las fechas de asistencias: ' + (err.response?.data || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const obtenerAsistenciasPorFecha = async (fecha) => {
    setLoading(true);
    try {
      const asistenciaInicial = profesores.reduce((acc, profe) => {
        acc[profe.id_usuario] = { asistio: 0, mediaFalta: 0, retiroAntes: 0 };
        return acc;
      }, {});

      const asistenciasFecha = fechasAsistencias.find(a => a.fecha === fecha);

      if (asistenciasFecha && asistenciasFecha.asistencias) {
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
      setError('Error al obtener asistencias: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id_usuario, campo) => {
    setAsistencia((prev) => {
      const nuevoEstado = { asistio: 0, mediaFalta: 0, retiroAntes: 0 };
      nuevoEstado[campo] = prev[id_usuario][campo] === 1 ? 0 : 1;
      return { ...prev, [id_usuario]: nuevoEstado };
    });
  };

  const enviarAsistencia = async () => {
    setLoading(true);
    try {
      const data = {
        alumnosCurso: Object.keys(asistencia).map((id_usuario) => ({
          idUsuario: parseInt(id_usuario),
          asistio: asistencia[id_usuario].asistio,
          mediaFalta: asistencia[id_usuario].mediaFalta,
          retiroAntes: asistencia[id_usuario].retiroAntes,
        })),
      };

      await axios.post('http://localhost:8080/api/usuario/tomarAsistenciaProfesor', data, { withCredentials: true });

      setMensaje('Asistencia registrada correctamente');

      if (activeTab === 'modificar') {
        obtenerFechasAsistencias();
      }
    } catch (err) {
      setMensaje('Error al registrar la asistencia: ' + (JSON.stringify(err.response?.data) || err.message));
    } finally {
      setLoading(false);
    }
  };

  const editarAsistencia = async () => {
    if (!fechaSeleccionada) {
      setMensaje('Por favor, seleccione una fecha');
      return;
    }

    if (!profesorSeleccionado) {
      setMensaje('Por favor, seleccione un profesor');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = [{
        idUsuario: parseInt(profesorSeleccionado),
        asistio: asistencia[profesorSeleccionado].asistio,
        mediaFalta: asistencia[profesorSeleccionado].mediaFalta,
        retiroAntes: asistencia[profesorSeleccionado].retiroAntes,
      }];

      await axios.patch(
        `http://localhost:8080/api/usuario/editarAsistenciaProfe?fecha=${fechaSeleccionada}`,
        dataToSend,
        { withCredentials: true }
      );

      setMensaje('Asistencia editada correctamente');
    } catch (err) {
      setMensaje('Error al editar la asistencia: ' + (JSON.stringify(err.response?.data) || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFechaChange = (fecha) => {
    setFechaSeleccionada(fecha);
    if (fecha) {
      obtenerAsistenciasPorFecha(fecha);
    }
  };

  const handleProfesorChange = (profesor) => {
    setProfesorSeleccionado(profesor);
  };

  const toggleTab = (tab) => {
    setActiveTab(tab);
    setMensaje('');
    setError(null);
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

  if (!isPremium) {
    return (
      <View style={styles.container}>
        <Text style={styles.warningText}>La toma y modificación de asistencia para profesores no está disponible para tu escuela.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gestión de Asistencia de Profesores</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'tomar' && styles.activeTab]}
          onPress={() => toggleTab('tomar')}
        >
          <Text style={styles.tabText}>Tomar Asistencia</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'modificar' && styles.activeTab]}
          onPress={() => toggleTab('modificar')}
        >
          <Text style={styles.tabText}>Modificar Asistencia</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {mensaje && <Text style={mensaje.includes('Error') ? styles.errorText : styles.successText}>{mensaje}</Text>}

      {activeTab === 'tomar' && (
        <View style={styles.card}>
          <View style={styles.row}>
            <Picker
              selectedValue={profesorSeleccionado}
              onValueChange={handleProfesorChange}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione un profesor" value="" />
              {profesores.map(profesor => (
                <Picker.Item key={profesor.id_usuario} label={`${profesor.nombre} ${profesor.apellido}`} value={profesor.id_usuario} />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.button}
              onPress={enviarAsistencia}
              disabled={!profesorSeleccionado}
            >
              <Text style={styles.buttonText}>Registrar Asistencia</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTab === 'modificar' && (
        <View style={styles.card}>
          <View style={styles.row}>
            <Picker
              selectedValue={fechaSeleccionada}
              onValueChange={handleFechaChange}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione una fecha" value="" />
              {fechasAsistencias.map(fecha => (
                <Picker.Item key={fecha} label={fecha} value={fecha} />
              ))}
            </Picker>
            <Picker
              selectedValue={profesorSeleccionado}
              onValueChange={handleProfesorChange}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione un profesor" value="" />
              {profesores.map(profesor => (
                <Picker.Item key={profesor.id_usuario} label={`${profesor.nombre} ${profesor.apellido}`} value={profesor.id_usuario} />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.button}
              onPress={editarAsistencia}
              disabled={!fechaSeleccionada || !profesorSeleccionado}
            >
              <Text style={styles.buttonText}>Editar Asistencia</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default GestionarAsistenciaProfesor;
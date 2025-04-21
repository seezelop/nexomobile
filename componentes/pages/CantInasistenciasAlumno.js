import React, { useEffect, useState } from "react";
import axios from "axios";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { API_BASE_URL } from '../../url';

function CantInasistenciasAlumno() {
  const [inasistencias, setInasistencias] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  useEffect(() => {
    const obtenerInasistencias = async () => {
      try {
        const response = await axiosInstance.get('/api/usuario/cantInasistenciasAlumno')

        setInasistencias(response.data);
      } catch (error) {
        setError("Error al obtener las inasistencias. Inténtelo nuevamente.");
        console.error("Error al obtener inasistencias:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerInasistencias();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inasistencias del Alumno</Text>

      {cargando ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Text style={styles.inasistencias}>{`Inasistencias: ${inasistencias}`}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
  },
  inasistencias: {
    fontSize: 18,
    marginTop: 20,
  },
});

export default CantInasistenciasAlumno;

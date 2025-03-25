import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../url';

function InformacionCursoAlumno() {
  const [infoCurso, setInfoCurso] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    const obtenerInfoCurso = async () => {
      setLoading(true);
      setError(null); // Limpiar error antes de nueva solicitud
      try {
        const response = await axiosInstance.get(`/api/usuario/verInfoAlumno`);
        setInfoCurso(response.data);
      } catch (error) {
        console.error('Error al obtener la información del alumno:', error);
        setError('Hubo un error al obtener la información.');
      } finally {
        setLoading(false);
      }
    };
    obtenerInfoCurso();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Información del Curso</Text>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.error}>{error}</Text>}

      {infoCurso && infoCurso.length > 0 ? (
        <ScrollView style={styles.infoContainer}>
          <Text style={styles.subTitle}>Notas</Text>
          {infoCurso[0]?.notas?.length > 0 ? (
            infoCurso[0].notas.map((nota, index) => (
              <View key={index} style={styles.card}>
                <Text><Text style={styles.bold}>Materia:</Text> {nota.nombre}</Text>
                <Text><Text style={styles.bold}>Tarea:</Text> {nota.descripcion}</Text>
                <Text><Text style={styles.bold}>Nota:</Text> {nota.nota}</Text>
                <Text>
                  <Text style={styles.bold}>Profesor:</Text> {nota.nombreP} {nota.apellidoP}
                </Text>
              </View>

            ))
          ) : (
            <Text>No hay notas registradas.</Text>
          )}

          <Text style={styles.subTitle}>Eventos</Text>
          {infoCurso[0]?.eventos?.length > 0 ? (
            infoCurso[0].eventos.map((evento, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.bold}>Descripción:</Text> <Text>{evento.descripcion}</Text>
                <Text style={styles.bold}>Fecha:</Text> <Text>{evento.fecha}</Text>
              </View>
            ))
          ) : (
            <Text>No hay eventos registrados.</Text>
          )}
        </ScrollView>
      ) : (
        !loading && <Text>No hay información del curso disponible.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  infoContainer: {
    marginTop: 10,
  },
  card: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default InformacionCursoAlumno;

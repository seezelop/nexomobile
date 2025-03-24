import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

function InformacionCursoAlumno() {
  const [infoCurso, setInfoCurso] = useState(null); // Información del curso del alumno
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerInfoCurso = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/usuario/verInfoAlumno`, { withCredentials: true });
        setInfoCurso(response.data); // Guardamos la información correctamente
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

      {infoCurso && infoCurso.length > 0 && (
        <ScrollView style={styles.infoContainer}>
          <Text style={styles.subTitle}>Notas</Text>
          {infoCurso[0].notas && infoCurso[0].notas.length > 0 ? (
            infoCurso[0].notas.map((nota, index) => (
              <View key={index} style={styles.card}>
                <Text><strong>Materia:</strong> {nota.nombre}</Text>
                <Text><strong>Tarea:</strong> {nota.descripcion}</Text>
                <Text><strong>Nota:</strong> {nota.nota}</Text>
                <Text><strong>Profesor:</strong> {nota.nombreP} {nota.apellidoP}</Text>
              </View>
            ))
          ) : (
            <Text>No hay notas registradas.</Text>
          )}

          <Text style={styles.subTitle}>Eventos</Text>
          {infoCurso[0].eventos && infoCurso[0].eventos.length > 0 ? (
            infoCurso[0].eventos.map((evento, index) => (
              <View key={index} style={styles.card}>
                <Text><strong>Descripción:</strong> {evento.descripcion}</Text>
                <Text><strong>Fecha:</strong> {evento.fecha}</Text>
              </View>
            ))
          ) : (
            <Text>No hay eventos registrados.</Text>
          )}
        </ScrollView>
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
});

export default InformacionCursoAlumno;

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from  '../../url';

function InformacionCurso() {
  const [hijos, setHijos] = useState([]);
  const [hijoSeleccionado, setHijoSeleccionado] = useState('');
  const [infoCurso, setInfoCurso] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    const obtenerHijos = async () => {
      try {
        const response = await axiosInstance.get('/api/usuario/verHijos');
        setHijos(response.data);
      } catch (error) {
        console.error('Error al obtener la lista de hijos:', error);
        alert('Hubo un error al obtener la lista de hijos.');
      }
    };
    obtenerHijos();
  }, []);

  useEffect(() => {
    if (!hijoSeleccionado) {
      setInfoCurso(null);
      return;
    }

    const obtenerInfoCurso = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/usuario/verInfoHijo/${hijoSeleccionado}`);
        setInfoCurso(response.data);
      } catch (error) {
        console.error('Error al obtener la información del curso:', error);
        alert('Hubo un error al obtener la información del curso.');
      } finally {
        setLoading(false);
      }
    };
    obtenerInfoCurso();
  }, [hijoSeleccionado]);

  const renderNotas = () => {
    if (!infoCurso || !infoCurso[0]?.notas?.length) {
      return <Text style={styles.noData}>No hay notas registradas.</Text>;
    }

    return (
      <FlatList
        data={infoCurso[0].notas}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}><Text style={styles.bold}>Materia:</Text> {item.nombre}</Text>
            <Text style={styles.cardText}><Text style={styles.bold}>Tarea:</Text> {item.descripcion}</Text>
            <Text style={styles.cardText}><Text style={styles.bold}>Nota:</Text> {item.nota}</Text>
            <Text style={styles.cardText}><Text style={styles.bold}>Profesor:</Text> {item.nombreP} {item.apellidoP}</Text>
          </View>
        )}
      />
    );
  };

  const renderEventos = () => {
    if (!infoCurso || !infoCurso[0]?.eventos?.length) {
      return <Text style={styles.noData}>No hay eventos registrados.</Text>;
    }

    return (
      <FlatList
        data={infoCurso[0].eventos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}><Text style={styles.bold}>Descripción:</Text> {item.descripcion}</Text>
            <Text style={styles.cardText}><Text style={styles.bold}>Fecha:</Text> {item.fecha}</Text>
          </View>
        )}
      />
    );
  };

  return (
    <FlatList
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Información del Curso</Text>
          <Text style={styles.subtitle}>Seleccione un hijo para ver la información de su curso.</Text>

          <Picker
            selectedValue={hijoSeleccionado}
            onValueChange={(itemValue) => setHijoSeleccionado(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione un hijo" value="" />
            {hijos.map((hijo) => (
              <Picker.Item key={hijo.idUsuario} label={`${hijo.nombre} ${hijo.apellido}`} value={hijo.idUsuario} />
            ))}
          </Picker>

          {loading && <ActivityIndicator size="large" color="#007bff" style={styles.loader} />}
        </>
      }
      ListFooterComponent={
        <>
          {infoCurso && infoCurso.length > 0 && (
            <View style={styles.infoContainer}>
              <Text style={styles.sectionTitle}>Notas</Text>
              {renderNotas()}

              <Text style={styles.sectionTitle}>Eventos</Text>
              {renderEventos()}
            </View>
          )}

          <Button title="Volver" onPress={() => navigation.goBack()} color="#007bff" />
        </>
      }
      data={[]}
      renderItem={null}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
    paddingHorizontal: 20,
  },
  picker: {
    backgroundColor: '#fff',
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
  },
  loader: {
    marginVertical: 20,
  },
  infoContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  noData: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
  },
});

export default InformacionCurso;
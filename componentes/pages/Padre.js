import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '../url';
import { useNavigation } from '@react-navigation/native';

function Padre({ navigation }) {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const route = useRoute();
  const [estadoPago, setEstadoPago] = useState('');
  const [precio, setPrecio] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  const redirigirAlumno = () => {
    navigation.navigate('CantInasistencias');
  };

  useEffect(() => {
    const status = route.params?.status; // Obtener el parámetro de la ruta
    setEstadoPago(status);

    if (status === "approved") {
      obtenerPrecioYGenerarComprobante();
    } else {
      setCargando(false);
    }
  }, [route.params]); 

  // Obtiene el precio antes de generar el comprobante
  const obtenerPrecioYGenerarComprobante = async () => {
    try {
      const response = await axiosInstance.get('/api/usuario/obtenerInfoCuota', {
        withCredentials: true,
      });

      const nuevoPrecio = response.data;
      setPrecio(nuevoPrecio);

      console.log("Precio obtenido:", nuevoPrecio);

      if (nuevoPrecio) {
        await generarComprobante(nuevoPrecio);
      }
    } catch (error) {
      console.error("Error al obtener la información de la cuota:", error);
    } finally {
      setCargando(false);
    }
  };

  const generarComprobante = async (importe) => {
    try {
      await axiosInstance.post(
        '/api/usuario/generarComprobante',
        { importe }
      );
    } catch (error) {
      console.error("Error al generar el comprobante:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido Padre</Text>
      <Text style={styles.subtitle}>
        Consulta el progreso académico y la asistencia de tus hijos en esta sección.
      </Text>
      <View style={styles.buttonContainer}>
              <Button title="Cantidad de Inasistencias" onPress={redirigirAlumno} />
            </View>

      {cargando ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : estadoPago === "approved" ? (
        <Text style={styles.success}>El pago fue aprobado, y estás al día con la cuota.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  success: {
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
});

export default Padre;

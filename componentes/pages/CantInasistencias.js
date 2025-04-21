import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { API_BASE_URL } from '../../url';

function CantInasistencias() {
  const [inasistencias, setInasistencias] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [hijos, setHijos] = useState([]);
  const [hijoSeleccionado, setHijoSeleccionado] = useState("");


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
        const response = await axiosInstance.get('/api/usuario/verHijos', {
          withCredentials: true,
        });
        setHijos(response.data);
      } catch (error) {
        setError("Error al obtener los hijos. Inténtelo nuevamente.");
        console.error("Error al obtener hijos:", error);
      }
    };

    obtenerHijos();
  }, []);

  useEffect(() => {
    const obtenerInasistencias = async () => {
      if (!hijoSeleccionado) return;

      setCargando(true);
      try {
        const response = await axiosInstance.get(
          `/api/usuario/cantInasistencias/${hijoSeleccionado}`,
          { withCredentials: true }
        );
        setInasistencias(response.data);
        setError(null);
      } catch (error) {
        setError("Error al obtener las inasistencias. Inténtelo nuevamente.");
        console.error("Error al obtener inasistencias:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerInasistencias();
  }, [hijoSeleccionado]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inasistencias</Text>

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

      {cargando && <ActivityIndicator size="large" color="#007bff" style={styles.loader} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {inasistencias !== null && <Text style={styles.success}>Inasistencias: {inasistencias}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  picker: {
    backgroundColor: "#fff",
    marginBottom: 20,
    borderRadius: 10,
    elevation: 3,
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    color: "red",
    textAlign: "center",
    fontSize: 16,
    marginTop: 10,
  },
  success: {
    color: "green",
    textAlign: "center",
    fontSize: 16,
    marginTop: 10,
  },
});

export default CantInasistencias;

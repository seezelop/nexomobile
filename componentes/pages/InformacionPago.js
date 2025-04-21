import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";
import { API_BASE_URL } from  '../../url';

const InformacionPago = () => {
  const [infoPago, setInfoPago] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const obtenerInfoPago = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/verInfoPago`, {
        withCredentials: true,
      });
      setInfoPago(response.data);
    } catch (err) {
      setError("Error al obtener la información de pago: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerInfoPago();
  }, []);

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Información de Pago</Text>
        <Text style={styles.cardBody}>{infoPago}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});

export default InformacionPago;
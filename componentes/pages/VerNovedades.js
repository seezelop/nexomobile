import React, { useState, useEffect } from "react";
import axios from "axios";
import { View, Text, ActivityIndicator, ScrollView, Alert } from "react-native";
import { Card } from "react-native-paper";
import { API_BASE_URL } from  '../../url';

function VerNovedades() {
  const [novedades, setNovedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  useEffect(() => {
    const cargarNovedades = async () => {
      try {
        const response = await axiosInstance.get('/verNovedades', {
          withCredentials: true,
        });

        if (response.status === 204) {
          setError("No hay novedades disponibles.");
        } else {
          setNovedades(response.data);
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar las novedades.");
      } finally {
        setCargando(false);
      }
    };

    cargarNovedades();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert("Advertencia", error, [{ text: "OK" }]);
    }
  }, [error]); // Este efecto solo se dispara cuando el error cambia

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
        Últimas Novedades
      </Text>

      {cargando && (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      <ScrollView>
        {novedades.map((novedad, index) => (
          <Card key={index} style={{ marginBottom: 10, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 }}>
            <Card.Content>
              <Text>{novedad.contenido}</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

export default VerNovedades;

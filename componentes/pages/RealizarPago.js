import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import { API_BASE_URL } from '../url';
import { useNavigation } from '@react-navigation/native';

const RealizarPago = () => {
  const [loading, setLoading] = useState(true);
  const [precio, setPrecio] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);
  const navigation = useNavigation();
  const detalle = "Cuota Escolar";

  // Obtener el precio de la cuota
  useEffect(() => {
    const fetchPrecio = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/usuario/obtenerInfoCuota`, {
          withCredentials: true,
        });
        setPrecio(response.data);
      } catch (error) {
        console.error("Error al obtener la información de la cuota:", error);
        Alert.alert("Error", "No se pudo cargar el monto de la cuota");
      } finally {
        setLoading(false);
      }
    };

    fetchPrecio();
  }, []);

  // Crear preferencia de pago
  const crearPreferencia = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://tu-backend.com/crear-preferencia", {
        items: [
          {
            title: detalle,
            quantity: 1,
            unit_price: precio,
          },
        ],
      });
      setPreferenceId(response.data.preferenceId);
      setModalVisible(true);
    } catch (error) {
      console.error("Error al crear la preferencia", error);
      Alert.alert("Error", "No se pudo iniciar el proceso de pago");
    } finally {
      setLoading(false);
    }
  };

  // Manejar resultado del pago
  const handlePaymentResult = (success) => {
    setModalVisible(false);
    if (success) {
      navigation.navigate('Padre', { pagoExitoso: true });
    } else {
      Alert.alert("Pago no completado", "El pago no se completó correctamente");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pago de Cuota Escolar</Text>
      
      <View style={styles.detailContainer}>
        <Text style={styles.detailText}>Detalle: {detalle}</Text>
        <Text style={styles.priceText}>
          Precio: {precio !== null ? `$${precio}` : "Cargando..."}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, (loading || precio === null) && styles.disabledButton]}
        onPress={crearPreferencia}
        disabled={loading || precio === null}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Continuar con Mercado Pago</Text>
        )}
      </TouchableOpacity>

      {/* Modal con WebView para MercadoPago */}
      {modalVisible && (
        <View style={styles.modalContainer}>
          <WebView
            source={{ uri: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}` }}
            style={styles.webview}
            onNavigationStateChange={(navState) => {
              // Manejar URLs de retorno (configura estas URLs en tu backend)
              if (navState.url.includes('/pago-exitoso')) {
                handlePaymentResult(true);
              } else if (navState.url.includes('/pago-fallido')) {
                handlePaymentResult(false);
              }
            }}
            onError={() => handlePaymentResult(false)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  detailContainer: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  button: {
    backgroundColor: '#009ee3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
  webview: {
    flex: 1,
  },
});

export default RealizarPago;
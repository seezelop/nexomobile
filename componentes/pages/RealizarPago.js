
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_MP, API_BASE_URL } from '../url';

const RealizarPago = () => {
  const [loading, setLoading] = useState(true);
  const [precio, setPrecio] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
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

  // Manejar el pago con MercadoPago
  const handlePayment = async () => {
    if (!precio) return;
    
    setProcessingPayment(true);
    try {
      // 1. Crear preferencia en tu backend
      const response = await axios.post(`${BACKEND_MP}/crear-preferencia`, {
        items: [{
          title: detalle,
          unit_price: parseFloat(precio),
          quantity: 1
        }],
        platform: 'mobile' // Indicamos que es para mobile
      }, {
        withCredentials: true
      });

      // 2. Abrir checkout de MercadoPago
      const { preferenceId } = response.data;
      const mpUrl = `https://mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;
      
      // Verificar si se puede abrir el enlace
      const canOpen = await Linking.canOpenURL(mpUrl);
      if (canOpen) {
        await Linking.openURL(mpUrl);
      } else {
        Alert.alert('Error', 'No se puede procesar el pago en este momento');
      }

    } catch (error) {
      console.error("Error al procesar el pago:", error);
      Alert.alert("Error", "No se pudo iniciar el proceso de pago");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Manejar deep linking para retorno después del pago
  useEffect(() => {
    const handleDeepLink = (event) => {
      // La URL podría estar en event.url o directamente en event dependiendo de la implementación
      const url = event.url || event;
      
      if (typeof url === 'string') {
        if (url.includes('pago-exitoso')) {
          navigation.navigate('/padre');
        } else if (url.includes('pago-fallido')) {
          navigation.navigate('/padre');
        }
      }
    };

    // Usar addListener en lugar de addEventListener (API moderna)
    const subscription = Linking.addListener('url', handleDeepLink);
    
    // Limpiar listener al desmontar usando la API moderna
    return () => {
      subscription.remove();
    };
  }, [navigation]);

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
        style={[styles.button, (loading || precio === null || processingPayment) && styles.disabledButton]}
        disabled={loading || precio === null || processingPayment}
        onPress={handlePayment}
      >
        {processingPayment ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Continuar con Mercado Pago</Text>
        )}
      </TouchableOpacity>
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
});

export default RealizarPago;
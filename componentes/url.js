import { Platform } from 'react-native';

const getLocalIP = () => {
  // IPs para diferentes escenarios
  const ips = {
    android: '192.168.0.160',  // Reemplaza con tu IP local
    ios: '192.168.0.160',      // Si también usas iOS
    web: 'localhost'           // Para web
  };

  return ips[Platform.OS] || 'localhost';
};

export const API_BASE_URL = 'http://192.168.0.160:8080';
export const BACKEND_MP =  `http://${getLocalIP()}:5000/crear-preferencia`
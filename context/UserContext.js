import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Crear el contexto
export const UserContext = createContext();

// Proveedor del contexto
export const UserProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [infoSesion, setInfoSesion] = useState(null);

  // Recuperar el rol desde AsyncStorage
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem('rol');
        if (savedRole) {
          setUserRole(savedRole);
          // Cargar más información si es necesario
          const fetchUserInfo = async () => {
            try {
              const response = await axios.get('http://localhost:8080/auth/info', { withCredentials: true });
              setInfoSesion(response.data);
            } catch (error) {
              console.error('Error al obtener la información del usuario', error);
            }
          };
          fetchUserInfo();
        }
      } catch (error) {
        console.error('Error al recuperar el rol desde AsyncStorage', error);
      }
    };

    loadUserRole();
  }, []);

  // Función para guardar el rol
  const saveUserRole = async (role) => {
    try {
      await AsyncStorage.setItem('rol', role);
      setUserRole(role);
    } catch (error) {
      console.error('Error al guardar el rol en AsyncStorage', error);
    }
  };

  return (
    <UserContext.Provider value={{ userRole, setUserRole: saveUserRole, infoSesion, setInfoSesion }}>
      {children}
    </UserContext.Provider>
  );
};

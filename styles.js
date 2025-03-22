import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6360AE', // color de fondo
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 30, // Tamaño de fuente más grande
    fontWeight: 'bold',
    color: '#fff', // Color de texto 
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#7958A5', // color fondo 
    borderRadius: 10, // Bordes redondeados
    shadowColor: '#000', // Sombra para dar profundidad
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5, // Sombra en Android
    marginBottom: 20, // Espaciado debajo del texto
  },
  button: {
    backgroundColor: '#AE4390', // Color para el botón
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10, // Bordes redondeados
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5, // Sombra en Android
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff', // Texto blanco
    textAlign: 'center',
  },
});

export default styles;

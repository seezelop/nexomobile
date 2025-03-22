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
  },
});

export default styles;
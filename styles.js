import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',  // Color blanco
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  



  container: {
    flex: 1,
    backgroundColor: '#6360AE', // color de fondo
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30, // Tamaño de fuente más grande
    fontWeight: 'bold',
    color: '#fff', // Color de texto 
    textAlign: 'center',
    marginBottom: 40, // Espacio debajo del título
    shadowColor: '#000', // Sombra para dar profundidad
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5, // Sombra en Android
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 10, // Bordes redondeados
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#000',
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
    marginTop: 20, // Espaciado arriba del botón
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff', // Texto blanco
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20, // Agregar espacio vertical entre los botones
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default styles;
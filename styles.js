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

  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'column', // Column for mobile, can adjust with responsive design
  },
  tableContainer: {
    marginTop: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  tableCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButton: {
    backgroundColor: '#007bff',
  },
  warningButton: {
    backgroundColor: '#ffc107',
  },
  disabledButton: {
    opacity: 0.6,
  },
  alert: {
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  alertText: {
    fontSize: 14,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  centeredText: {
    textAlign: 'center',
    padding: 16,
    color: '#6c757d',
  },
});

export default styles;

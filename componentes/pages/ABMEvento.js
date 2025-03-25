import React from 'react';
import AltaEvento from './AltaEvento';
import BajaEvento from './BajaEvento';
import ModificarEvento from './ModificarEvento';
import { ScrollView, View, Text, StyleSheet } from 'react-native';



function ABMEvento() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Alta de Evento */}
        <View style={styles.cardSection}>
          <Text style={styles.cardTitle}>ALTA EVENTO</Text>
          <AltaEvento />
        </View>

        {/* Baja de Evento */}
        <View style={styles.cardSection}>
          <Text style={styles.cardTitle}>BAJA EVENTO</Text>
          <BajaEvento />
        </View>

        {/* Modificación de Evento */}
        <View style={styles.cardSection}>
          <Text style={styles.cardTitle}>MODIFICAR EVENTO</Text>
          <ModificarEvento />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 800,
    padding: 20,
  },
  cardSection: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default ABMEvento;

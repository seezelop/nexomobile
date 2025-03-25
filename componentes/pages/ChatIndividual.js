import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert } from "react-native";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { API_BASE_URL } from '../url';

const ChatIndividual = () => {
  const route = useRoute();
  const { mail } = route.params;
  const [mensajes, setMensajes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoContenido, setNuevoContenido] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  //ESTO ES PARA QUE EL MENSAJE PUEDA EDITARSE
   const axiosInstance2 = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'text/plain',
      }
    });

  useEffect(() => {
    const obtenerUsuarioAutenticado = async () => {
      try {
        const response = await axiosInstance.get('/api/usuario/usuarioLogueado', {
          withCredentials: true,
        });
        setUserEmail(response.data);
      } catch (error) {
        console.error("Error al obtener el usuario autenticado:", error);
      }
    };

    obtenerUsuarioAutenticado();
  }, []);

  useEffect(() => {
    const cargarMensajes = async () => {
      try {
        const response = await axiosInstance.get(
          `/obtenerMensajesEntreUsuarios/${mail}`,
          { withCredentials: true }
        );
        setMensajes(response.status === 204 ? [] : response.data);
      } catch (error) {
        console.error("Error al cargar los mensajes:", error);
      }
    };

    cargarMensajes();
  }, [mail]);

  const enviarMensaje = async () => {
    if (!mensaje.trim() || mensaje.length < 2 || mensaje.length > 255) {
      Alert.alert("Error", "El mensaje debe tener entre 2 y 255 caracteres.");
      return;
    }

    const nuevoMensaje = { contenido: mensaje, destinatario: mail };

    try {
      await axiosInstance.post('/nuevoMensaje', nuevoMensaje, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      setMensajes([...mensajes, { idMensaje: Date.now(), contenido: mensaje, mail: userEmail }]);
      setMensaje("");
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
  };

  const editarMensaje = async (idMensaje, nuevoContenido) => {
    try {
      await axiosInstance2.patch(`/editarMensajePrivado/${idMensaje}`, nuevoContenido, {
        headers: { "Content-Type": "text/plain" },
        withCredentials: true,
      });

      setMensajes(mensajes.map((msg) =>
        msg.idMensaje === idMensaje ? { ...msg, contenido: nuevoContenido } : msg
      ));
      setEditandoId(null);
    } catch (error) {
      console.error("Error al editar el mensaje:", error);
    }
  };

  const borrarMensaje = async (idMensaje) => {
    try {
      await axiosInstance.delete(`/borrarMensaje/${idMensaje}`, { withCredentials: true });
      setMensajes(mensajes.filter((msg) => msg.idMensaje !== idMensaje));
    } catch (error) {
      console.error("Error al borrar el mensaje:", error);
    }
  };

  const renderMensaje = (msg) => {
    const isOwnMessage = msg.mail === userEmail;

    return (
      <View 
        key={msg.idMensaje} 
        style={[
          styles.mensajeContainer, 
          { 
            alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
            backgroundColor: isOwnMessage ? '#E6F2FF' : '#F0F0F0'
          }
        ]}
      >
        <Text style={styles.mensajeEmail}>{msg.mail}:</Text>
        
        {editandoId === msg.idMensaje ? (
          <TextInput
            value={nuevoContenido}
            onChangeText={setNuevoContenido}
            style={styles.editInput}
          />
        ) : (
          <Text style={styles.mensajeTexto}>{msg.contenido}</Text>
        )}

        {isOwnMessage && (
          <View style={styles.accionesContainer}>
            {editandoId === msg.idMensaje ? (
              <>
                <TouchableOpacity onPress={() => editarMensaje(msg.idMensaje, nuevoContenido)}>
                  <Icon name="check" size={20} color="green" style={styles.iconoAccion} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditandoId(null)}>
                  <Icon name="times" size={20} color="red" style={styles.iconoAccion} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => {
                  setEditandoId(msg.idMensaje);
                  setNuevoContenido(msg.contenido);
                }}>
                  <Icon name="edit" size={20} color="blue" style={styles.iconoAccion} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => borrarMensaje(msg.idMensaje)}>
                  <Icon name="trash" size={20} color="red" style={styles.iconoAccion} />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Chat con {mail}</Text>
      </View>
      
      <ScrollView 
        style={styles.mensajesContainer}
        contentContainerStyle={styles.mensajesContentContainer}
      >
        {mensajes.length === 0 ? (
          <Text style={styles.sinMensajesTexto}>No hay mensajes aún.</Text>
        ) : (
          mensajes.map(renderMensaje)
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          value={mensaje}
          onChangeText={setMensaje}
          placeholder="Escribe un mensaje..."
          style={styles.input}
        />
        <TouchableOpacity 
          onPress={enviarMensaje}
          disabled={mensaje.length < 2 || mensaje.length > 255}
          style={[
            styles.botonEnviar, 
            { 
              opacity: (mensaje.length < 2 || mensaje.length > 255) ? 0.5 : 1 
            }
          ]}
        >
          <Text style={styles.botonEnviarTexto}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    backgroundColor: '#2575fc',
    paddingVertical: 15,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mensajesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  mensajesContentContainer: {
    paddingVertical: 10,
  },
  mensajeContainer: {
    maxWidth: '80%',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mensajeEmail: {
    fontSize: 12,
    color: '#555',
    marginBottom: 5,
  },
  mensajeTexto: {
    fontSize: 16,
    color: '#333',
  },
  sinMensajesTexto: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    marginRight: 10,
  },
  botonEnviar: {
    backgroundColor: '#2575fc',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  botonEnviarTexto: {
    color: 'white',
    fontWeight: 'bold',
  },
  accionesContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  iconoAccion: {
    marginHorizontal: 5,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 5,
    marginTop: 5,
  },
});

export default ChatIndividual;
import React, { Component } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Button } from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../url';
import { Picker } from '@react-native-picker/picker';

class SeleccionarCurso extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cursos: [],
            alumnos: [],
            materias: [],
            cursoSeleccionado: 'Seleccione un curso',
            idCurso: null,
            numero: '',
            division: '',
            nombreP: '',
            apellidoP: '',
            error: '',
        };
    }

    axiosInstance = axios.create({
        baseURL: API_BASE_URL,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Cargar la lista de cursos
    cargarCursos = async () => {
        try {
            const response = await this.axiosInstance.get('/api/usuario/verCursos', {
                withCredentials: true,
            });

            const cursos = response.data.map((curso) => ({
                idCurso: curso.idCurso,
                nombre: `${curso.numero} ${curso.division}`,
                numero: curso.numero,
                division: curso.division,
                activo: curso.activo,
                error: ''
            }));

            this.setState({ cursos });
        } catch (error) {
            const errorMessage = error.response?.data || 'Error desconocido al cargar la información';
            this.setState({ error: errorMessage });
        }
    };

    // Obtener información adicional del curso
    obtenerInfo = async (idCurso) => {
        try {
            const response = await this.axiosInstance.get(`/api/usuario/selectCurso/${idCurso}`, {
                withCredentials: true,
            });
    
            const curso = response.data[0];
    
            this.setState({
                alumnos: curso.alumnos || [],
                materias: curso.materias || [],
                numero: curso.numero?.toString() || '',
                division: curso.division || '',
                nombreP: curso.nombreP || '',
                apellidoP: curso.apellidoP || '',
                error: '', // Limpiamos el error si todo salió bien
            });
    
        } catch (error) {
            const errorMessage = error.response?.data || 'Error desconocido al cargar la información';
            this.setState({ error: errorMessage }); // Guardamos el error en el estado
        }
    };
    

    componentDidMount() {
        this.cargarCursos();
    }

    // Manejar selección de curso
    handleDropdownChange = (itemValue) => {
        const selectedCurso = this.state.cursos.find(curso => curso.idCurso === itemValue);

        this.setState({
            cursoSeleccionado: selectedCurso ? selectedCurso.nombre : 'Seleccione un curso',
            idCurso: itemValue,
            numero: selectedCurso.numero,
            division: selectedCurso.division,
        });

        if (itemValue) {
            this.obtenerInfo(itemValue);
        }
    };

    render() {
        const {
            cursos,
            cursoSeleccionado,
            numero,
            division,
            nombreP,
            apellidoP,
            alumnos,
            materias,
        } = this.state;

        return (
            <View style={styles.container}>
                <Text style={styles.label}>Curso</Text>
                <Picker
                    selectedValue={this.state.idCurso}
                    onValueChange={this.handleDropdownChange}
                    style={styles.picker}
                >
                    <Picker.Item label="Seleccione un curso" value={null} />
                    {cursos.map((curso) => (
                        <Picker.Item key={curso.idCurso} label={curso.nombre} value={curso.idCurso} />
                    ))}
                </Picker>

                {cursoSeleccionado !== 'Seleccione un curso' && (
                    <>
                        {this.state.error ? (
                            <Text style={styles.errorText}>{this.state.error}</Text>
                        ) : null}

                        <TextInput
                            style={styles.input}
                            value={numero}
                            placeholder="Número"
                            editable={false}
                        />
                        <TextInput
                            style={styles.input}
                            value={division}
                            placeholder="División"
                            editable={false}
                        />
                        <TextInput
                            style={styles.input}
                            value={nombreP}
                            placeholder="Nombre Preceptor"
                            editable={false}
                        />
                        <TextInput
                            style={styles.input}
                            value={apellidoP}
                            placeholder="Apellido Preceptor"
                            editable={false}
                        />

                        <Text style={styles.sectionTitle}>Alumnos:</Text>
                        <FlatList
                            data={alumnos}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <Text style={styles.listItem}>{item.nombre} {item.apellido}</Text>
                            )}
                        />

                        <Text style={styles.sectionTitle}>Materias:</Text>
                        <FlatList
                            data={materias}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <Text style={styles.listItem}>
                                    <Text style={styles.boldText}>{item.nombre}</Text> - Profesor: {item.nombreProfesor} {item.apellidoProfesor}
                                </Text>
                            )}
                        />
                    </>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 8,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    listItem: {
        fontSize: 16,
        marginVertical: 5,
    },
    boldText: {
        fontWeight: 'bold',
    },
});

export default SeleccionarCurso;

import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { medicionService, sensorService, authService, cultivoService,fincaService } from "./services/api";

function MenuNavegacion({ rutaActual, esAdmin }: { rutaActual: string; esAdmin: boolean }) {
  const menus = [
    { ruta: "/dashboard", icono: "H", texto: "Inicio" },
    { ruta: "/fincas", icono: "F", texto: "Fincas" },
    { ruta: "/cultivos", icono: "C", texto: "Cultivos" },
    { ruta: "/riegos", icono: "R", texto: "Riegos" },
    { ruta: "/sensores", icono: "S", texto: "Sensores" },
    { ruta: "/mediciones", icono: "M", texto: "Mide" },
    { ruta: "/alertas", icono: "A", texto: "Alertas" },
  ];
  if (esAdmin) {
    menus.push({ ruta: "/usuarios", icono: "U", texto: "Users" });
  }
  return (
    <View style={styles.menu}>
      {menus.map((menu) => (
        <TouchableOpacity key={menu.ruta} style={[styles.menuItem, rutaActual === menu.ruta && styles.menuItemActivo]} onPress={() => router.push(menu.ruta as any)}>
          <Text style={styles.menuIcono}>{menu.icono}</Text>
          <Text style={[styles.menuTexto, rutaActual === menu.ruta && styles.menuTextoActivo]}>{menu.texto}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function Mediciones() {
  const esAdmin = authService.isAdmin();
  const [mediciones, setMediciones] = useState<any[]>([]);
  const [sensores, setSensores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  
  const [idSensor, setIdSensor] = useState<number | null>(null);
  const [valor, setValor] = useState("");

  useEffect(() => {
    const user = authService.getUser();
    if (user?.id_usuario) {
      setIdUsuario(user.id_usuario);
    } else if (user?.id) {
      setIdUsuario(user.id);
    }
  }, []);

  useEffect(() => { 
    if (idUsuario !== null) {
      cargarDatos(); 
    }
  }, [idUsuario]);

  const cargarDatos = async () => {
    try {
      // Obtener las fincas del usuario
      let fincasData;
      if (esAdmin) {
        fincasData = await fincaService.getAll();
      } else if (idUsuario) {
        fincasData = await fincaService.getByUsuario(idUsuario);
      } else {
        fincasData = [];
      }
      const fincasArray = Array.isArray(fincasData) ? fincasData : [];
      const fincaIds = fincasArray.map((f: any) => f.id);
      
      // Obtener los cultivos de esas fincas
      const todosCultivos = await cultivoService.getAll();
      const cultivosFiltrados = Array.isArray(todosCultivos)
        ? todosCultivos.filter((c: any) => fincaIds.includes(c.id_finca))
        : [];
      
      // Obtener los sensores de esos cultivos
      const todosSensores = await sensorService.getAll();
      const sensoresFiltrados = Array.isArray(todosSensores)
        ? todosSensores.filter((s: any) => cultivosFiltrados.map((c: any) => c.id).includes(s.id_cultivo))
        : [];
      setSensores(sensoresFiltrados);
      
      const sensorIds = sensoresFiltrados.map((s: any) => s.id);
      
      // Cargar todas las mediciones y filtrar por los sensores del usuario
      const todasMediciones = await medicionService.getAll();
      const medicionesFiltradas = Array.isArray(todasMediciones)
        ? todasMediciones.filter((m: any) => sensorIds.includes(m.id_sensor))
        : [];
      setMediciones(medicionesFiltradas);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const crearMedicion = async () => {
    if (!idSensor || !valor) { Alert.alert("Error", "Todos los campos son obligatorios"); return; }
    try {
      await medicionService.create({ id_sensor: idSensor, valor_humedad: parseFloat(valor) });
      Alert.alert("Éxito", "Medición creada");
      setIdSensor(null); setValor("");
      setMostrarForm(false);
      cargarDatos();
    } catch (e) { Alert.alert("Error", "No se pudo crear la medición"); }
  };

  const limpiarForm = () => {
    setIdSensor(null); setValor("");
    setMostrarForm(false);
  };

  const eliminarMedicion = async (id: number) => {
    Alert.alert("Confirmar", "¿Eliminar esta medición?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try {
          await medicionService.delete(id);
          cargarDatos();
          Alert.alert("Éxito", "Medición eliminada");
        } catch (e) { Alert.alert("Error", "No se pudo eliminar"); }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitulo}>Humedad: {item.valor_humedad}%</Text>
        <Text style={styles.itemTexto}>Fecha: {item.fecha_medicion}</Text>
        <Text style={styles.itemTexto}>Sensor ID: {item.id_sensor}</Text>
      </View>
      <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminarMedicion(item.id)}>
        <Text>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mediciones</Text>
        {esAdmin && (
          <TouchableOpacity style={styles.btnAgregar} onPress={() => setMostrarForm(!mostrarForm)}>
            <Text style={styles.btnAgregarText}>{mostrarForm ? "Cancelar" : "+ Nueva"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {mostrarForm && (
        <View style={styles.form}>
          <Text style={styles.label}>Seleccionar Sensor:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {sensores.map((sensor: any) => (
              <TouchableOpacity
                key={sensor.id}
                style={[styles.chip, idSensor === sensor.id && styles.chipSeleccionado]}
                onPress={() => setIdSensor(sensor.id)}
              >
                <Text style={[styles.chipText, idSensor === sensor.id && styles.chipTextSeleccionado]}>
                  {sensor.tipo_sensor}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput style={styles.input} placeholder="Valor de Humedad (%)" value={valor} onChangeText={setValor} keyboardType="numeric" />
          <TouchableOpacity style={styles.boton} onPress={crearMedicion}>
            <Text style={styles.botonTexto}>Crear Medición</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList data={mediciones} renderItem={renderItem} keyExtractor={(item) => item.id?.toString() || Math.random().toString()} contentContainerStyle={{ padding: 10 }} refreshing={loading} onRefresh={cargarDatos} />
      <MenuNavegacion rutaActual="/mediciones" esAdmin={esAdmin} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#2563eb", padding: 20, paddingTop: 50 },
  titulo: { fontSize: 22, color: "#fff", fontWeight: "bold", textAlign: "center" },
  btnAgregar: { backgroundColor: "#22c55e", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: "center", marginTop: 10 },
  btnAgregarText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  form: { backgroundColor: "#fff", margin: 10, padding: 15, borderRadius: 10 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 10 },
  chipContainer: { flexDirection: "row", marginBottom: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#e5e7eb", marginRight: 8 },
  chipSeleccionado: { backgroundColor: "#f59e0b" },
  chipText: { fontSize: 14, color: "#333" },
  chipTextSeleccionado: { color: "#fff" },
  boton: { backgroundColor: "#2563eb", padding: 15, borderRadius: 8, alignItems: "center" },
  botonTexto: { color: "#fff", fontWeight: "bold" },
  item: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: "row", alignItems: "center", elevation: 2 },
  itemTitulo: { fontSize: 16, fontWeight: "bold", color: "#d97706" },
  itemTexto: { fontSize: 13, color: "#666", marginTop: 3 },
  btnEliminar: { padding: 10, backgroundColor: "#ef4444", borderRadius: 8 },
  menu: { flexDirection: "row", backgroundColor: "#1e3a8a", paddingVertical: 12, paddingBottom: 25, justifyContent: "space-around" },
  menuItem: { alignItems: "center", paddingHorizontal: 8 },
  menuItemActivo: { backgroundColor: "#2563eb", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  menuIcono: { fontSize: 16, fontWeight: "bold", color: "#94a3b8" },
  menuTexto: { fontSize: 10, color: "#94a3b8", marginTop: 2 },
  menuTextoActivo: { color: "#fff", fontWeight: "bold" },
});

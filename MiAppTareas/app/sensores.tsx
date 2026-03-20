import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { sensorService, cultivoService, authService,fincaService } from "./services/api";

function MenuNavegacion({ rutaActual, esAdmin }: { rutaActual: string; esAdmin: boolean }) {
  const menus = [
    { ruta: "/dashboard", icono: "🏠", texto: "Inicio" },
    { ruta: "/fincas", icono: "🌾", texto: "Fincas" },
    { ruta: "/cultivos", icono: "🌱", texto: "Cultivos" },
    { ruta: "/riegos", icono: "💧", texto: "Riegos" },
    { ruta: "/sensores", icono: "📡", texto: "Sensores" },
    { ruta: "/mediciones", icono: "📈", texto: "Mediciones" },
    { ruta: "/alertas", icono: "🔔", texto: "Alertas" },
  ];
  if (esAdmin) {
    menus.push({ ruta: "/usuarios", icono: "👥", texto: "Usuarios" });
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

export default function Sensores() {
  const esAdmin = authService.isAdmin();
  const [sensores, setSensores] = useState<any[]>([]);
  const [cultivos, setCultivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  
  const [tipo, setTipo] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [estado, setEstado] = useState("Activo");
  const [idCultivo, setIdCultivo] = useState<number | null>(null);

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
      setCultivos(cultivosFiltrados);
      
      const cultivoIds = cultivosFiltrados.map((c: any) => c.id);
      
      // Cargar todos los sensores y filtrar por los cultivos del usuario
      const todosSensores = await sensorService.getAll();
      const sensoresFiltrados = Array.isArray(todosSensores)
        ? todosSensores.filter((s: any) => cultivoIds.includes(s.id_cultivo))
        : [];
      setSensores(sensoresFiltrados);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const seleccionarCultivo = (cultivoId: number) => {
    setIdCultivo(cultivoId === idCultivo ? null : cultivoId);
  };

  const guardarSensor = async () => {
    if (!tipo || !ubicacion || !idCultivo) { Alert.alert("Error", "Todos los campos son obligatorios"); return; }
    try {
      const data = { tipo_sensor: tipo, nombre: tipo, ubicacion, estado, id_cultivo: idCultivo };
      if (editando) {
        await sensorService.update(editando.id, data);
        Alert.alert("Éxito", "Sensor actualizado");
      } else {
        await sensorService.create(data);
        Alert.alert("Éxito", "Sensor creado");
      }
      limpiarForm();
      cargarDatos();
    } catch (e) { Alert.alert("Error", "No se pudo guardar el sensor"); }
  };

  const eliminarSensor = async (id: number) => {
    Alert.alert("Confirmar", "¿Eliminar este sensor?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try {
          await sensorService.delete(id);
          cargarDatos();
          Alert.alert("Éxito", "Sensor eliminado");
        } catch (e) { Alert.alert("Error", "No se pudo eliminar"); }
      }}
    ]);
  };

  const editarSensor = (item: any) => {
    setEditando(item);
    setTipo(item.tipo_sensor);
    setUbicacion(item.ubicacion);
    setEstado(item.estado);
    setIdCultivo(item.id_cultivo);
    setMostrarForm(true);
  };

  const limpiarForm = () => {
    setTipo(""); setUbicacion(""); setEstado("Activo"); setIdCultivo(null);
    setEditando(null);
    setMostrarForm(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitulo}>📡 {item.tipo_sensor}</Text>
        <Text style={styles.itemTexto}>📍 {item.ubicacion}</Text>
        <Text style={styles.itemTexto}>✅ Estado: {item.estado}</Text>
      </View>
      <View style={styles.botones}>
        <TouchableOpacity style={styles.btnEditar} onPress={() => editarSensor(item)}><Text>✏️</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminarSensor(item.id)}><Text>🗑️</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={styles.header}>
        <Text style={styles.titulo}>📡 Gestión de Sensores</Text>
        {esAdmin && (
          <TouchableOpacity style={styles.btnAgregar} onPress={() => setMostrarForm(!mostrarForm)}>
            <Text style={styles.btnAgregarText}>{mostrarForm ? "✖️ Cancelar" : "➕ Agregar"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {mostrarForm && (
        <View style={styles.form}>
          <Text style={styles.formTitulo}>{editando ? "Editar Sensor" : "Nuevo Sensor"}</Text>
          <TextInput style={styles.input} placeholder="Tipo de sensor" value={tipo} onChangeText={setTipo} />
          <TextInput style={styles.input} placeholder="Ubicación" value={ubicacion} onChangeText={setUbicacion} />
          <Text style={styles.label}>Cultivo:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {cultivos.map((cultivo: any) => (
              <TouchableOpacity
                key={cultivo.id}
                style={[styles.chip, idCultivo === cultivo.id && styles.chipSeleccionado]}
                onPress={() => setIdCultivo(cultivo.id)}
              >
                <Text style={[styles.chipText, idCultivo === cultivo.id && styles.chipTextSeleccionado]}>
                  {cultivo.tipo_cultivo}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput style={styles.input} placeholder="Estado (Activo/Inactivo)" value={estado} onChangeText={setEstado} />
          <TouchableOpacity style={styles.boton} onPress={guardarSensor}>
            <Text style={styles.botonTexto}>{editando ? "Actualizar" : "Crear Sensor"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList data={sensores} renderItem={renderItem} keyExtractor={(item) => item.id?.toString() || Math.random().toString()} contentContainerStyle={{ padding: 10 }} refreshing={loading} onRefresh={cargarDatos} />
      <MenuNavegacion rutaActual="/sensores" esAdmin={esAdmin} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#2563eb", padding: 20, paddingTop: 50 },
  titulo: { fontSize: 24, color: "#fff", fontWeight: "bold", textAlign: "center" },
  btnAgregar: { backgroundColor: "#22c55e", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: "center", marginTop: 10 },
  btnAgregarText: { color: "#fff", fontWeight: "bold" },
  form: { backgroundColor: "#fff", margin: 10, padding: 15, borderRadius: 10 },
  formTitulo: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#2563eb" },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 10 },
  chipContainer: { flexDirection: "row", marginBottom: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#e5e7eb", marginRight: 8 },
  chipSeleccionado: { backgroundColor: "#2563eb" },
  chipText: { fontSize: 14, color: "#333" },
  chipTextSeleccionado: { color: "#fff" },
  boton: { backgroundColor: "#2563eb", padding: 15, borderRadius: 8, alignItems: "center" },
  botonTexto: { color: "#fff", fontWeight: "bold" },
  item: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  itemTitulo: { fontSize: 18, fontWeight: "bold", color: "#8b5cf6" },
  itemTexto: { fontSize: 14, color: "#666", marginTop: 4 },
  botones: { flexDirection: "row" },
  btnEditar: { padding: 10, marginRight: 5 },
  btnEliminar: { padding: 10 },
  menu: { flexDirection: "row", backgroundColor: "#2563eb", paddingVertical: 12, paddingBottom: 25, justifyContent: "space-around" },
  menuItem: { alignItems: "center", paddingHorizontal: 8 },
  menuItemActivo: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  menuIcono: { fontSize: 20 },
  menuTexto: { fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  menuTextoActivo: { color: "#fff", fontWeight: "bold" },
});

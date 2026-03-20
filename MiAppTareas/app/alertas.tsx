import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ScrollView } from "react-native";
import { router } from "expo-router";
import { alertaService, authService, medicionService, sensorService, cultivoService,fincaService } from "./services/api";

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
    menus.push({ ruta: "/usuarios", icono: "👥", texto: "Usuarios"});
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

export default function Alertas() {
  const esAdmin = authService.isAdmin();
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  
  const [tipo, setTipo] = useState("Nota");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("baja");

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
      
      const sensorIds = sensoresFiltrados.map((s: any) => s.id);
      
      // Obtener las mediciones de esos sensores
      const todasMediciones = await medicionService.getAll();
      const medicionesFiltradas = Array.isArray(todasMediciones)
        ? todasMediciones.filter((m: any) => sensorIds.includes(m.id_sensor))
        : [];
      
      const medicionIds = medicionesFiltradas.map((m: any) => m.id);
      
      // Cargar todas las alertas y filtrar por las mediciones del usuario
      const todasAlertas = await alertaService.getAll();
      const alertasFiltradas = Array.isArray(todasAlertas)
        ? todasAlertas.filter((a: any) => 
            a.id_medicion === null || a.id_medicion === undefined || medicionIds.includes(a.id_medicion)
          )
        : [];
      setAlertas(alertasFiltradas);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getColor = (prioridad: string) => {
    if (prioridad === "alta") return "#ef4444";
    if (prioridad === "media") return "#f59e0b";
    return "#22c55e";
  };

  const crearNota = async () => {
    if (!descripcion) {
      Alert.alert("Error", "La descripción es obligatoria");
      return;
    }
    try {
      await alertaService.create({
        tipo_alerta: tipo,
        descripcion,
        prioridad
      });
      Alert.alert("Éxito", "Nota creada correctamente");
      setDescripcion("");
      setMostrarForm(false);
      cargarDatos();
    } catch (e) {
      Alert.alert("Error", "No se pudo crear la nota");
    }
  };

  const marcarLeida = async (id: number) => {
    try {
      await alertaService.marcarLeida(id);
      cargarDatos();
      Alert.alert("Éxito", "Alerta marcada como leída");
    } catch (e) {
      Alert.alert("Error", "No se pudo marcar como leída");
    }
  };

  const eliminarAlerta = async (id: number) => {
    Alert.alert("Confirmar", "¿Eliminar esta alerta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try {
          await alertaService.delete(id);
          cargarDatos();
          Alert.alert("Éxito", "Alerta eliminada");
        } catch (e) {
          Alert.alert("Error", "No se pudo eliminar");
        }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.item, { borderLeftColor: getColor(item.prioridad), opacity: item.leida ? 0.6 : 1 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitulo}>🔔 {item.tipo_alerta}</Text>
        <Text style={styles.itemTexto}>{item.descripcion}</Text>
        <Text style={[styles.itemPrioridad, { color: getColor(item.prioridad) }]}>
          Prioridad: {item.prioridad} {item.leida ? "✅ Leída" : "❗ Nueva"}
        </Text>
      </View>
      <View style={styles.botones}>
        {!item.leida && (
          <TouchableOpacity style={styles.btnLeida} onPress={() => marcarLeida(item.id)}>
            <Text>✅</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminarAlerta(item.id)}>
          <Text>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={styles.header}>
        <Text style={styles.titulo}>🔔 Gestión de Alertas</Text>
        <TouchableOpacity style={styles.btnAgregar} onPress={() => setMostrarForm(!mostrarForm)}>
          <Text style={styles.btnAgregarText}>{mostrarForm ? "✖️ Cancelar" : "➕ Agregar Nota"}</Text>
        </TouchableOpacity>
      </View>

      {mostrarForm && (
        <View style={styles.form}>
          <Text style={styles.formTitulo}>Nueva Nota</Text>
          <TextInput style={styles.input} placeholder="Tipo de nota" value={tipo} onChangeText={setTipo} />
          <TextInput style={styles.input} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} multiline />
          <TouchableOpacity style={styles.boton} onPress={crearNota}>
            <Text style={styles.botonTexto}>Crear Nota</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList data={alertas} renderItem={renderItem} keyExtractor={(item) => item.id?.toString() || Math.random().toString()} contentContainerStyle={{ padding: 10 }} refreshing={loading} onRefresh={cargarDatos} />
      <MenuNavegacion rutaActual="/alertas" esAdmin={esAdmin} />
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
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 10 },
  boton: { backgroundColor: "#2563eb", padding: 15, borderRadius: 8, alignItems: "center" },
  botonTexto: { color: "#fff", fontWeight: "bold" },
  item: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4, flexDirection: "row", alignItems: "center" },
  itemTitulo: { fontSize: 16, fontWeight: "bold", color: "#ef4444" },
  itemTexto: { fontSize: 14, color: "#666", marginTop: 4 },
  itemPrioridad: { fontSize: 12, fontWeight: "bold", marginTop: 4 },
  botones: { flexDirection: "row" },
  btnLeida: { padding: 10, marginRight: 5 },
  btnEliminar: { padding: 10 },
  menu: { flexDirection: "row", backgroundColor: "#2563eb", paddingVertical: 12, paddingBottom: 25, justifyContent: "space-around" },
  menuItem: { alignItems: "center", paddingHorizontal: 8 },
  menuItemActivo: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  menuIcono: { fontSize: 20 },
  menuTexto: { fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  menuTextoActivo: { color: "#fff", fontWeight: "bold" },
});

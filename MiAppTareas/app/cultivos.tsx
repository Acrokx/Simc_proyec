import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { cultivoService,fincaService, authService } from "./services/api";

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

export default function Cultivos() {
  const esAdmin = authService.isAdmin();
  const [cultivos, setCultivos] = useState<any[]>([]);
  const [fincas, setFincas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  
  const [tipo, setTipo] = useState("");
  const [idFinca, setIdFinca] = useState<number | null>(null);
  const [estado, setEstado] = useState("Activo");

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
      let fincasData;
      if (esAdmin) {
        fincasData = await fincaService.getAll();
      } else if (idUsuario) {
        fincasData = await fincaService.getByUsuario(idUsuario);
      } else {
        fincasData = [];
      }
      const fincasArray = Array.isArray(fincasData) ? fincasData : [];
      setFincas(fincasArray);
      
      // Obtener los IDs de las fincas del usuario
      const fincaIds = fincasArray.map((f: any) => f.id);
      
      // Cargar todos los cultivos y filtrar por las fincas del usuario
      const todosCultivos = await cultivoService.getAll();
      const cultivosFiltrados = Array.isArray(todosCultivos) 
        ? todosCultivos.filter((c: any) => fincaIds.includes(c.id_finca))
        : [];
      setCultivos(cultivosFiltrados);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const guardarCultivo = async () => {
    if (!tipo || !idFinca) { Alert.alert("Error", "Todos los campos son obligatorios"); return; }
    try {
      const data = { tipo_cultivo: tipo, fecha_siembra: new Date().toISOString().split('T')[0], estado, id_finca: idFinca };
      if (editando) {
        await cultivoService.update(editando.id, data);
        Alert.alert("Éxito", "Cultivo actualizado");
      } else {
        await cultivoService.create(data);
        Alert.alert("Éxito", "Cultivo creado");
      }
      limpiarForm();
      cargarDatos();
    } catch (e) { Alert.alert("Error", "No se pudo guardar el cultivo"); }
  };

  const eliminarCultivo = async (id: number) => {
    Alert.alert("Confirmar", "¿Eliminar este cultivo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try {
          await cultivoService.delete(id);
          cargarDatos();
          Alert.alert("Éxito", "Cultivo eliminado");
        } catch (e) { Alert.alert("Error", "No se pudo eliminar"); }
      }}
    ]);
  };

  const editarCultivo = (item: any) => {
    setEditando(item);
    setTipo(item.tipo_cultivo);
    setIdFinca(item.id_finca);
    setEstado(item.estado);
    setMostrarForm(true);
  };

  const limpiarForm = () => {
    setTipo(""); setIdFinca(null); setEstado("Activo");
    setEditando(null);
    setMostrarForm(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitulo}>{item.tipo_cultivo}</Text>
        <Text style={styles.itemTexto}>📅 Siembra: {item.fecha_siembra}</Text>
        <Text style={styles.itemTexto}>✅ Estado: {item.estado}</Text>
      </View>
      <View style={styles.botones}>
        <TouchableOpacity style={styles.btnEditar} onPress={() => editarCultivo(item)}><Text>✏️</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminarCultivo(item.id)}><Text>🗑️</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={styles.header}>
        <Text style={styles.titulo}>🌱 Gestión de Cultivos</Text>
        {esAdmin && (
          <TouchableOpacity style={styles.btnAgregar} onPress={() => setMostrarForm(!mostrarForm)}>
            <Text style={styles.btnAgregarText}>{mostrarForm ? "✖️ Cancelar" : "➕ Agregar"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {mostrarForm && (
        <View style={styles.form}>
          <Text style={styles.formTitulo}>{editando ? "Editar Cultivo" : "Nuevo Cultivo"}</Text>
          <TextInput style={styles.input} placeholder="Tipo de cultivo" value={tipo} onChangeText={setTipo} />
          <Text style={styles.label}>Seleccionar Finca:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {fincas.map((finca: any) => (
              <TouchableOpacity
                key={finca.id}
                style={[styles.chip, idFinca === finca.id && styles.chipSeleccionado]}
                onPress={() => setIdFinca(finca.id)}
              >
                <Text style={[styles.chipText, idFinca === finca.id && styles.chipTextSeleccionado]}>
                  {finca.nombre_finca}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput style={styles.input} placeholder="Estado (Activo/Inactivo)" value={estado} onChangeText={setEstado} />
          <TouchableOpacity style={styles.boton} onPress={guardarCultivo}>
            <Text style={styles.botonTexto}>{editando ? "Actualizar" : "Crear Cultivo"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList data={cultivos} renderItem={renderItem} keyExtractor={(item) => item.id?.toString() || Math.random().toString()} contentContainerStyle={{ padding: 10 }} refreshing={loading} onRefresh={cargarDatos} />
      <MenuNavegacion rutaActual="/cultivos" esAdmin={esAdmin} />
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
  chipSeleccionado: { backgroundColor: "#22c55e" },
  chipText: { fontSize: 14, color: "#333" },
  chipTextSeleccionado: { color: "#fff" },
  boton: { backgroundColor: "#2563eb", padding: 15, borderRadius: 8, alignItems: "center" },
  botonTexto: { color: "#fff", fontWeight: "bold" },
  item: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  itemTitulo: { fontSize: 18, fontWeight: "bold", color: "#22c55e" },
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

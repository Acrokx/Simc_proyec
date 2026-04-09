import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { riegoService, cultivoService, authService, fincaService } from "./services/api";

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

export default function Riegos() {
  const esAdmin = authService.isAdmin();
  const [riegos, setRiegos] = useState<any[]>([]);
  const [cultivos, setCultivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  
  const [idCultivo, setIdCultivo] = useState<number | null>(null);
  const [cantidadAgua, setCantidadAgua] = useState("");
  const [fechaRiego, setFechaRiego] = useState(new Date().toISOString().split('T')[0]);

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
      
      // Cargar todos los riegos y filtrar por los cultivos del usuario
      const todosRiegos = await riegoService.getAll();
      const riegosFiltrados = Array.isArray(todosRiegos)
        ? todosRiegos.filter((r: any) => cultivoIds.includes(r.id_cultivo))
        : [];
      setRiegos(riegosFiltrados);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const guardarRiego = async () => {
    if (!idCultivo || !cantidadAgua) { Alert.alert("Error", "Todos los campos son obligatorios"); return; }
    try {
      const data = { 
        fecha_riego: fechaRiego,
        cantidad_agua: parseFloat(cantidadAgua), 
        id_cultivo: idCultivo 
      };
      if (editando) {
        await riegoService.update(editando.id, data);
        Alert.alert("Éxito", "Riego actualizado");
      } else {
        await riegoService.create(data);
        Alert.alert("Éxito", "Riego registrado");
      }
      limpiarForm();
      cargarDatos();
    } catch (e) { Alert.alert("Error", "No se pudo guardar el riego"); }
  };

  const eliminarRiego = async (id: number) => {
    Alert.alert("Confirmar", "¿Eliminar este riego?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try {
          await riegoService.delete(id);
          cargarDatos();
          Alert.alert("Éxito", "Riego eliminado");
        } catch (e) { Alert.alert("Error", "No se pudo eliminar"); }
      }}
    ]);
  };

  const editarRiego = (item: any) => {
    setEditando(item);
    setIdCultivo(item.id_cultivo);
    setCantidadAgua(item.cantidad_agua?.toString() || "");
    setFechaRiego(item.fecha_riego);
    setMostrarForm(true);
  };

  const limpiarForm = () => {
    setIdCultivo(null); setCantidadAgua(""); setFechaRiego(new Date().toISOString().split('T')[0]);
    setEditando(null);
    setMostrarForm(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitulo}>Riego: {item.cantidad_agua} L</Text>
        <Text style={styles.itemTexto}>Fecha: {item.fecha_riego}</Text>
        <Text style={styles.itemTexto}>Cultivo ID: {item.id_cultivo}</Text>
      </View>
      <View style={styles.botones}>
        <TouchableOpacity style={styles.btnEditar} onPress={() => editarRiego(item)}><Text>E</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminarRiego(item.id)}><Text>X</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Riegos</Text>
        {esAdmin && (
          <TouchableOpacity style={styles.btnAgregar} onPress={() => setMostrarForm(!mostrarForm)}>
            <Text style={styles.btnAgregarText}>{mostrarForm ? "Cancelar" : "+ Nuevo"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {mostrarForm && (
        <View style={styles.form}>
          <Text style={styles.formTitulo}>{editando ? "Editar Riego" : "Nuevo Riego"}</Text>
          <Text style={styles.label}>Seleccionar Cultivo:</Text>
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
          <TextInput style={styles.input} placeholder="Cantidad de agua (L)" value={cantidadAgua} onChangeText={setCantidadAgua} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Fecha (YYYY-MM-DD)" value={fechaRiego} onChangeText={setFechaRiego} />
          <TouchableOpacity style={styles.boton} onPress={guardarRiego}>
            <Text style={styles.botonTexto}>{editando ? "Actualizar" : "Registrar Riego"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList data={riegos} renderItem={renderItem} keyExtractor={(item) => item.id?.toString() || Math.random().toString()} contentContainerStyle={{ padding: 10 }} refreshing={loading} onRefresh={cargarDatos} />
      <MenuNavegacion rutaActual="/riegos" esAdmin={esAdmin} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#2563eb", padding: 20, paddingTop: 50 },
  titulo: { fontSize: 22, color: "#fff", fontWeight: "bold", textAlign: "center" },
  btnAgregar: { backgroundColor: "#22c55e", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: "center", marginTop: 10 },
  btnAgregarText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  form: { backgroundColor: "#fff", margin: 10, padding: 15, borderRadius: 10 },
  formTitulo: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#2563eb" },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 10 },
  chipContainer: { flexDirection: "row", marginBottom: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#e5e7eb", marginRight: 8 },
  chipSeleccionado: { backgroundColor: "#3b82f6" },
  chipText: { fontSize: 14, color: "#333" },
  chipTextSeleccionado: { color: "#fff" },
  boton: { backgroundColor: "#2563eb", padding: 15, borderRadius: 8, alignItems: "center" },
  botonTexto: { color: "#fff", fontWeight: "bold" },
  item: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: "row", alignItems: "center", elevation: 2 },
  itemTitulo: { fontSize: 16, fontWeight: "bold", color: "#0ea5e9" },
  itemTexto: { fontSize: 13, color: "#666", marginTop: 3 },
  botones: { flexDirection: "row" },
  btnEditar: { padding: 10, marginRight: 5, backgroundColor: "#f59e0b", borderRadius: 8 },
  btnEliminar: { padding: 10, backgroundColor: "#ef4444", borderRadius: 8 },
  menu: { flexDirection: "row", backgroundColor: "#1e3a8a", paddingVertical: 12, paddingBottom: 25, justifyContent: "space-around" },
  menuItem: { alignItems: "center", paddingHorizontal: 8 },
  menuItemActivo: { backgroundColor: "#2563eb", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  menuIcono: { fontSize: 16, fontWeight: "bold", color: "#94a3b8" },
  menuTexto: { fontSize: 10, color: "#94a3b8", marginTop: 2 },
  menuTextoActivo: { color: "#fff", fontWeight: "bold" },
});

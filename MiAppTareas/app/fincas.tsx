import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import {fincaService, authService} from "./services/api";

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

export default function Fincas() {
  const esAdmin = authService.isAdmin();
  const [fincas, setFincas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [idUsuario, setIdUsuario] = useState<number | null>(null);
  
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [tamano, setTamano] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    const user = authService.getUser();
    if (user?.id_usuario) {
      setIdUsuario(user.id_usuario);
    } else if (user?.id) {
      setIdUsuario(user.id);
    }
  }, []);

  useEffect(() => { 
    if (idUsuario) {
      cargarFincas(); 
    }
  }, [idUsuario]);

  const cargarFincas = async () => {
    try {
      let data;
      if (esAdmin) {
        // Los administradores ven todas las fincas
        data = await fincaService.getAll();
      } else if (idUsuario) {
        // Los agricultores ven solo sus fincas
        data = await fincaService.getByUsuario(idUsuario);
      } else {
        data = [];
      }
      setFincas(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const guardarFinca = async () => {
    if (!nombre || !ubicacion || !tamano) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }
    if (!idUsuario && !esAdmin) {
      Alert.alert("Error", "No se ha identificado al usuario");
      return;
    }
    try {
      const data = { 
        nombre_finca: nombre, 
        ubicacion, 
        tamaño_hectareas: parseFloat(tamano), 
        descripcion,
        id_usuario: idUsuario 
      };
      if (editando) {
        await fincaService.update(editando.id, data);
        Alert.alert("Éxito", "Finca actualizada");
      } else {
        await fincaService.create(data);
        Alert.alert("Éxito", "Finca creada");
      }
      limpiarForm();
      cargarFincas();
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar la finca");
    }
  };

  const eliminarFinca = async (id: number) => {
    Alert.alert("Confirmar", "¿Eliminar esta finca?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try {
          await fincaService.delete(id);
          cargarFincas();
          Alert.alert("Éxito", "Finca eliminada");
        } catch (e) {
          Alert.alert("Error", "No se pudo eliminar");
        }
      }}
    ]);
  };

  const editarFinca = (item: any) => {
    setEditando(item);
    setNombre(item.nombre_finca);
    setUbicacion(item.ubicacion);
    setTamano(item.tamaño_hectareas?.toString() || "");
    setDescripcion(item.descripcion || "");
    setMostrarForm(true);
  };

  const limpiarForm = () => {
    setNombre(""); setUbicacion(""); setTamano(""); setDescripcion("");
    setEditando(null);
    setMostrarForm(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitulo}>{item.nombre_finca}</Text>
        <Text style={styles.itemTexto}>📍 {item.ubicacion}</Text>
        <Text style={styles.itemTexto}>📐 {item.tamaño_hectareas} hectáreas</Text>
      </View>
      {esAdmin && (
        <View style={styles.botones}>
          <TouchableOpacity style={styles.btnEditar} onPress={() => editarFinca(item)}>
            <Text>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminarFinca(item.id)}>
            <Text>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={styles.header}>
        <Text style={styles.titulo}>🌾 Gestión de Fincas</Text>
        {esAdmin && (
          <TouchableOpacity style={styles.btnAgregar} onPress={() => setMostrarForm(!mostrarForm)}>
            <Text style={styles.btnAgregarText}>{mostrarForm ? "✖️ Cancelar" : "➕ Agregar"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {mostrarForm && (
        <View style={styles.form}>
          <Text style={styles.formTitulo}>{editando ? "Editar Finca" : "Nueva Finca"}</Text>
          <TextInput style={styles.input} placeholder="Nombre de la finca" value={nombre} onChangeText={setNombre} />
          <TextInput style={styles.input} placeholder="Ubicación" value={ubicacion} onChangeText={setUbicacion} />
          <TextInput style={styles.input} placeholder="Tamaño (hectáreas)" value={tamano} onChangeText={setTamano} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} multiline />
          <TouchableOpacity style={styles.boton} onPress={guardarFinca}>
            <Text style={styles.botonTexto}>{editando ? "Actualizar" : "Crear Finca"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList data={fincas} renderItem={renderItem} keyExtractor={(item) => item.id?.toString() || Math.random().toString()} contentContainerStyle={{ padding: 10 }} refreshing={loading} onRefresh={cargarFincas} />
      <MenuNavegacion rutaActual="/fincas" esAdmin={esAdmin} />
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
  item: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  itemTitulo: { fontSize: 18, fontWeight: "bold", color: "#2563eb" },
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

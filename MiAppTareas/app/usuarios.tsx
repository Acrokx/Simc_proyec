import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal } from "react-native";
import { router } from "expo-router";
import { agricultorService, authService } from "./services/api";

function MenuNavegacion({ rutaActual, esAdmin }: { rutaActual: string; esAdmin: boolean }) {
  const menus = [
    { ruta: "/dashboard", icono: "🏠", texto: "Inicio" },
    { ruta: "/fincas", icono: "🌾", texto: "Fincas" },
    { ruta: "/cultivos", icono: "🌱", texto: "Cultivos" },
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

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null);
  const esAdmin = authService.isAdmin();
  
  // Formulario crear
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  
  // Formulario editar
  const [editNombre, setEditNombre] = useState("");
  const [editApellido, setEditApellido] = useState("");
  const [editTelefono, setEditTelefono] = useState("");

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    if (!esAdmin) { setLoading(false); return; }
    try {
      const data = await agricultorService.getAll();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const crearAgricultor = async () => {
    if (!nombre || !apellido || !correo || !password) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }
    try {
      await agricultorService.create({
        nombre, apellido, correo, password, telefono, rol: "Agricultor"
      });
      Alert.alert("Éxito", "Agricultor creado correctamente");
      setNombre(""); setApellido(""); setCorreo(""); setPassword(""); setTelefono("");
      setMostrarForm(false);
      cargarDatos();
    } catch (e) {
      Alert.alert("Error", "No se pudo crear el agricultor");
    }
  };

  const abrirEditar = (usuario: any) => {
    setUsuarioEditando(usuario);
    setEditNombre(usuario.nombre || "");
    setEditApellido(usuario.apellido || "");
    setEditTelefono(usuario.telefono || "");
    setMostrarEditar(true);
  };

  const guardarEdicion = async () => {
    if (!usuarioEditando) return;
    try {
      await agricultorService.update(usuarioEditando.id, {
        nombre: editNombre,
        apellido: editApellido,
        telefono: editTelefono
      });
      Alert.alert("Éxito", "Usuario actualizado correctamente");
      setMostrarEditar(false);
      setUsuarioEditando(null);
      cargarDatos();
    } catch (e) {
      Alert.alert("Error", "No se pudo actualizar el usuario");
    }
  };

  const eliminarUsuario = async (id: number) => {
    Alert.alert("Confirmar", "¿Estás seguro de eliminar este usuario?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try {
          await agricultorService.delete(id);
          cargarDatos();
          Alert.alert("Éxito", "Usuario eliminado");
        } catch (e) {
          Alert.alert("Error", "No se pudo eliminar");
        }
      }}
    ]);
  };

  if (!esAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
        <View style={styles.header}><Text style={styles.titulo}>👥 Usuarios</Text></View>
        <View style={styles.noAdmin}><Text style={styles.noAdminText}>No tienes acceso a esta sección</Text></View>
        <MenuNavegacion rutaActual="/usuarios" esAdmin={esAdmin} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitulo}>👤 {item.nombre} {item.apellido}</Text>
        <Text style={styles.itemTexto}>📧 {item.correo}</Text>
        <Text style={styles.itemTexto}>📱 {item.telefono || 'Sin teléfono'}</Text>
        <Text style={styles.itemTexto}> Rol: {item.rol}</Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={styles.btnEditar} onPress={() => abrirEditar(item)}>
          <Text style={styles.btnEditarText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnEliminar} onPress={() => eliminarUsuario(item.id)}>
          <Text style={styles.btnEliminarText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={styles.header}>
        <Text style={styles.titulo}>👥 Gestión de Usuarios</Text>
        <TouchableOpacity style={styles.btnAgregar} onPress={() => setMostrarForm(!mostrarForm)}>
          <Text style={styles.btnAgregarText}>{mostrarForm ? "✖️ Cancelar" : "➕ Agregar"}</Text>
        </TouchableOpacity>
      </View>

      {mostrarForm && (
        <View style={styles.form}>
          <Text style={styles.formTitulo}>Crear Nuevo Agricultor</Text>
          <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
          <TextInput style={styles.input} placeholder="Apellido" value={apellido} onChangeText={setApellido} />
          <TextInput style={styles.input} placeholder="Correo" value={correo} onChangeText={setCorreo} keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput style={styles.input} placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
          <TouchableOpacity style={styles.boton} onPress={crearAgricultor}>
            <Text style={styles.botonTexto}>Crear Usuario</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de edición */}
      <Modal visible={mostrarEditar} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>✏️ Editar Usuario</Text>
            <TextInput style={styles.input} placeholder="Nombre" value={editNombre} onChangeText={setEditNombre} />
            <TextInput style={styles.input} placeholder="Apellido" value={editApellido} onChangeText={setEditApellido} />
            <TextInput style={styles.input} placeholder="Teléfono" value={editTelefono} onChangeText={setEditTelefono} keyboardType="phone-pad" />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={[styles.boton, styles.botonCancelar]} onPress={() => setMostrarEditar(false)}>
                <Text style={styles.botonTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.boton} onPress={guardarEdicion}>
                <Text style={styles.botonTexto}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList 
        data={usuarios} 
        renderItem={renderItem} 
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()} 
        contentContainerStyle={{ padding: 10 }} 
        refreshing={loading} 
        onRefresh={cargarDatos} 
      />
      <MenuNavegacion rutaActual="/usuarios" esAdmin={esAdmin} />
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
  boton: { backgroundColor: "#2563eb", padding: 15, borderRadius: 8, alignItems: "center", flex: 1, marginHorizontal: 5 },
  botonTexto: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  botonCancelar: { backgroundColor: "#6b7280" },
  item: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  itemTitulo: { fontSize: 16, fontWeight: "bold", color: "#2563eb" },
  itemTexto: { fontSize: 14, color: "#666", marginTop: 4 },
  btnEditar: { padding: 10, marginRight: 5 },
  btnEditarText: { fontSize: 20 },
  btnEliminar: { padding: 10 },
  btnEliminarText: { fontSize: 20 },
  noAdmin: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  noAdminText: { fontSize: 16, color: "#666", textAlign: "center" },
  menu: { flexDirection: "row", backgroundColor: "#2563eb", paddingVertical: 12, paddingBottom: 25, justifyContent: "space-around" },
  menuItem: { alignItems: "center", paddingHorizontal: 8 },
  menuItemActivo: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  menuIcono: { fontSize: 20 },
  menuTexto: { fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  menuTextoActivo: { color: "#fff", fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: 15, padding: 20, width: "85%", maxHeight: "80%" },
  modalTitulo: { fontSize: 20, fontWeight: "bold", color: "#2563eb", marginBottom: 15, textAlign: "center" },
});

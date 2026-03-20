import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { authService, perfilService } from "./services/api";

function MenuNavegacion({ rutaActual, esAdmin }: { rutaActual: string; esAdmin: boolean }) {
  const menus = [
    { ruta: "/dashboard", icono: "🏠", texto: "Inicio" },
    { ruta: "/fincas", icono: "🌾", texto: "Fincas" },
    { ruta: "/cultivos", icono: "🌱", texto: "Cultivos" },
    { ruta: "/sensores", icono: "📡", texto: "Sensores" },
    { ruta: "/mediciones", icono: "📈", texto: "Mediciones" },
    { ruta: "/alertas", icono: "🔔", texto: "Alertas" },
  ];
  
  // Agregar usuarios solo si es administrador
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

export default function Perfil() {
  const usuario = authService.getUser() || {};
  const esAdmin = authService.isAdmin();
  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [apellido, setApellido] = useState(usuario?.apellido || "");
  const [telefono, setTelefono] = useState(usuario?.telefono || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const guardarPerfil = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }
    setLoading(true);
    try {
      const data: any = {
        correo: usuario?.correo,
        nombre,
        apellido,
        telefono,
      };
      if (password.trim()) {
        data.password = password;
      }
      
      const response = await perfilService.update(data);
      if (response.success) {
        Alert.alert("Éxito", "Perfil actualizado correctamente");
        setPassword("");
      } else {
        Alert.alert("Error", response.error || "No se pudo actualizar");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const cerrarSesion = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar", style: "destructive", onPress: async () => {
        await authService.logout();
        router.replace("/");
      }}
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={styles.header}>
        <Text style={styles.titulo}>👤 Mi Perfil</Text>
      </View>

      <ScrollView style={styles.contenido}>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Rol:</Text>
            <Text style={styles.valor}>{usuario?.rol}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Correo:</Text>
            <Text style={styles.valor}>{usuario?.correo}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitulo}>Editar Información</Text>
          
          <Text style={styles.inputLabel}>Nombre *</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Tu nombre" />
          
          <Text style={styles.inputLabel}>Apellido</Text>
          <TextInput style={styles.input} value={apellido} onChangeText={setApellido} placeholder="Tu apellido" />
          
          <Text style={styles.inputLabel}>Teléfono</Text>
          <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} placeholder="Tu teléfono" keyboardType="phone-pad" />
          
          <Text style={styles.inputLabel}>Nueva Contraseña (opcional)</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Nueva contraseña" secureTextEntry />
          
          <TouchableOpacity style={styles.boton} onPress={guardarPerfil} disabled={loading}>
            <Text style={styles.botonTexto}>{loading ? "Guardando..." : "💾 Guardar Cambios"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.botonCerrar} onPress={cerrarSesion}>
          <Text style={styles.botonCerrarTexto}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <MenuNavegacion rutaActual="/perfil" esAdmin={esAdmin} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#2563eb", padding: 20, paddingTop: 50 },
  titulo: { fontSize: 24, color: "#fff", fontWeight: "bold", textAlign: "center" },
  contenido: { flex: 1, padding: 15 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginBottom: 15 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  label: { fontSize: 14, color: "#666", fontWeight: "600" },
  valor: { fontSize: 14, color: "#333" },
  subtitulo: { fontSize: 18, fontWeight: "bold", color: "#2563eb", marginBottom: 15 },
  inputLabel: { fontSize: 14, color: "#666", marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, backgroundColor: "#f9fafb" },
  boton: { backgroundColor: "#2563eb", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20 },
  botonTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  botonCerrar: { backgroundColor: "#dc2626", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10, marginBottom: 20 },
  botonCerrarTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  menu: { flexDirection: "row", backgroundColor: "#2563eb", paddingVertical: 12, paddingBottom: 25, justifyContent: "space-around" },
  menuItem: { alignItems: "center", paddingHorizontal: 8 },
  menuItemActivo: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  menuIcono: { fontSize: 20 },
  menuTexto: { fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  menuTextoActivo: { color: "#fff", fontWeight: "bold" },
});

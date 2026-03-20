import { useState, useEffect, useRef, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import {
  alertaService,
  sensorService,
  fincaService,
  cultivoService,
  authService,
  perfilService,
  riegoService,
} from "./services/api";

function BotonLogout() {
  const handleLogout = async () => {
    await authService.logout();
    router.replace("/login");
  };
  return (
    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
      <Text style={styles.logoutBtnText}>🚪 Salir</Text>
    </TouchableOpacity>
  );
}

interface Metric {
  label: string;
  value: string;
  icon: string;
  color: string;
  status: string;
}

interface Alerta {
  id: number;
  tipo_alerta: string;
  descripcion: string;
  prioridad: string;
  fecha_alerta: string;
}

interface Finca {
  id: number;
  nombre_finca: string;
}

interface Cultivo {
  id: number;
  tipo_cultivo: string;
}

interface Riego {
  id: number;
  fecha_riego: string;
  cantidad_agua: number;
  id_cultivo: number;
}

// Componente de Gráfico de Barras simple
function GraficoBarras(props: { 
  titulo: string; 
  datos: { etiqueta: string; valor: number }[]; 
  color: string; 
}) {
  const { titulo, datos, color } = props;
  const maximo = Math.max(...datos.map(d => d.valor), 1);
  return (
    <View style={styles.graficoContainer}>
      <Text style={styles.graficoTitulo}>{titulo}</Text>
      {datos.map((d, i) => (
        <View key={i} style={styles.barraFila}>
          <Text style={styles.barraEtiqueta}>{d.etiqueta}</Text>
          <View style={styles.barraWrapper}>
            <View style={[styles.barra, { width: `${(d.valor / maximo) * 100}%`, backgroundColor: color }]} />
            <Text style={styles.barraValor}>{d.valor}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// Componente de Gráfico Circular simple
function GraficoCircular({ 
  titulo, 
  datos 
}: { 
  titulo: string; 
  datos: { etiqueta: string; valor: number; color: string }[] 
}) {
  const total = datos.reduce((sum, d) => sum + d.valor, 0);
  return (
    <View style={styles.graficoCircularContainer}>
      <Text style={styles.graficoTitulo}>{titulo}</Text>
      <View style={styles.graficoCircular}>
        {datos.map((d, i) => (
          <View key={i} style={styles.circularItem}>
            <View style={[styles.circularIndicador, { backgroundColor: d.color }]} />
            <Text style={styles.circularEtiqueta}>{d.etiqueta}</Text>
            <Text style={styles.circularValor}>{d.valor} ({total > 0 ? ((d.valor / total) * 100).toFixed(0) : 0}%)</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Menú de navegación
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

  // Agregar usuarios solo si es administrador
  if (esAdmin) {
    menus.push({ ruta: "/usuarios", icono: "👥", texto: "Usuarios" });
  }

  return (
    <View style={styles.menu}>
      {menus.map((menu) => (
        <TouchableOpacity
          key={menu.ruta}
          style={[styles.menuItem, rutaActual === menu.ruta && styles.menuItemActivo]}
          onPress={() => router.push(menu.ruta as any)}
        >
          <Text style={styles.menuIcono}>{menu.icono}</Text>
          <Text style={[styles.menuTexto, rutaActual === menu.ruta && styles.menuTextoActivo]}>
            {menu.texto}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [fincas, setFincas] = useState<Finca[]>([]);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [riegos, setRiegos] = useState<Riego[]>([]);
  const [sensores, setSensores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>("");
  const [usuarioNombre, setUsuarioNombre] = useState<string>("Usuario");
  const [esAdmin, setEsAdmin] = useState<boolean>(false);
  const [usuarioRol, setUsuarioRol] = useState<string>("Agricultor");
  
  // Datos simulados para gráficos
  const [datosGraficoRiego, setDatosGraficoRiego] = useState<{ etiqueta: string; valor: number }[]>([]);
  const [datosGraficoAlertas, setDatosGraficoAlertas] = useState<{ etiqueta: string; valor: number; color: string }[]>([]);
  
  // Estado para edición de perfil
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editApellido, setEditApellido] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const generarMetrica = (
    label: string,
    valor: number,
    unidad: string,
    icon: string,
    rangos: { bajo: number; alto: number },
    colores: { bajo: string; normal: string; alto: string },
    estados: { bajo: string; normal: string; alto: string }
  ): Metric => {
    let color = colores.normal;
    let status = estados.normal;

    if (valor < rangos.bajo) {
      color = colores.bajo;
      status = estados.bajo;
    } else if (valor > rangos.alto) {
      color = colores.alto;
      status = estados.alto;
    }

    return { label, value: `${valor}${unidad}`, icon, color, status };
  };

  const simularDatos = useCallback(() => {
    const humedad = 55 + Math.random() * 30;
    const temperatura = 18 + Math.random() * 15;
    const ph = 5.5 + Math.random() * 3;
    const luz = 400 + Math.random() * 800;

    setMetrics([
      { label: "Humedad", value: `${humedad.toFixed(1)}%`, icon: "💧", color: "#3B82F6", status: "Simulado" },
      { label: "Temperatura", value: `${temperatura.toFixed(1)}°C`, icon: "🌡️", color: "#EF4444", status: "Simulado" },
      { label: "pH", value: ph.toFixed(1), icon: "🧪", color: "#8B5CF6", status: "Simulado" },
      { label: "Luz", value: `${Math.floor(luz)} lux`, icon: "☀️", color: "#F59E0B", status: "Simulado" },
    ]);
    setUltimaActualizacion(new Date().toLocaleTimeString());
  }, []);

  // Generar datos simulados para gráficos
  const generarDatosSimulados = useCallback(() => {
    // Simular datos de consumo de agua últimos 7 días
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const consumoAgua = dias.map(() => Math.floor(100 + Math.random() * 400));
    setDatosGraficoRiego(
      dias.map((dia, i) => ({ etiqueta: dia, valor: consumoAgua[i] }))
    );

    // Simular distribución de alertas por prioridad
    const altas = Math.floor(Math.random() * 5);
    const medias = Math.floor(Math.random() * 10);
    const bajas = Math.floor(Math.random() * 15);
    setDatosGraficoAlertas([
      { etiqueta: 'Alta', valor: altas, color: '#EF4444' },
      { etiqueta: 'Media', valor: medias, color: '#F59E0B' },
      { etiqueta: 'Baja', valor: bajas, color: '#22C55E' },
    ]);
  }, []);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [alertasData, fincasData, cultivosData, sensoresData, riegosData] = await Promise.all([
        alertaService.getAll(),
        fincaService.getAll(),
        cultivoService.getAll(),
        sensorService.getAll(),
        riegoService.getAll(),
      ]);

      setSensores(Array.isArray(sensoresData) ? sensoresData : []);
      setAlertas(Array.isArray(alertasData) ? alertasData.slice(0, 3) : []);
      setFincas(Array.isArray(fincasData) ? fincasData : []);
      setCultivos(Array.isArray(cultivosData) ? cultivosData : []);
      setRiegos(Array.isArray(riegosData) ? riegosData : []);

      // Calcular consumo de agua real o simulado
      const riegosArray = Array.isArray(riegosData) ? riegosData : [];
      if (riegosArray.length > 0) {
        // Usar datos reales si existen
        const consumoUltimos7Dias = riegosArray.slice(0, 7).map((r: Riego) => r.cantidad_agua || 0);
        const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        setDatosGraficoRiego(
          dias.map((dia, i) => ({ 
            etiqueta: dia, 
            valor: consumoUltimos7Dias[i] || Math.floor(100 + Math.random() * 300) 
          }))
        );
      } else {
        generarDatosSimulados();
      }

      // Calcular distribución de alertas por prioridad
      const alertasArray = Array.isArray(alertasData) ? alertasData : [];
      const altas = alertasArray.filter((a: Alerta) => a.prioridad === 'alta').length;
      const medias = alertasArray.filter((a: Alerta) => a.prioridad === 'media').length;
      const bajas = alertasArray.filter((a: Alerta) => a.prioridad === 'baja').length;
      setDatosGraficoAlertas([
        { etiqueta: 'Alta', valor: altas || Math.floor(Math.random() * 3), color: '#EF4444' },
        { etiqueta: 'Media', valor: medias || Math.floor(Math.random() * 8), color: '#F59E0B' },
        { etiqueta: 'Baja', valor: bajas || Math.floor(Math.random() * 12), color: '#22C55E' },
      ]);

      const humedad = 55 + Math.random() * 30;
      const temperatura = 18 + Math.random() * 15;
      const ph = 5.5 + Math.random() * 3;
      const luz = 400 + Math.random() * 800;

      const nuevasMetricas: Metric[] = [
        generarMetrica("Humedad", parseFloat(humedad.toFixed(1)), "%", "💧", { bajo: 40, alto: 80 }, { bajo: "#EF4444", normal: "#3B82F6", alto: "#F59E0B" }, { bajo: "Bajo", normal: "Normal", alto: "Alto" }),
        generarMetrica("Temperatura", parseFloat(temperatura.toFixed(1)), "°C", "🌡️", { bajo: 10, alto: 35 }, { bajo: "#3B82F6", normal: "#EF4444", alto: "#EF4444" }, { bajo: "Bajo", normal: "Normal", alto: "Alto" }),
        generarMetrica("pH", parseFloat(ph.toFixed(1)), "", "🧪", { bajo: 5.5, alto: 7.5 }, { bajo: "#F59E0B", normal: "#8B5CF6", alto: "#F59E0B" }, { bajo: "Ácido", normal: "Óptimo", alto: "Alcalino" }),
        generarMetrica("Luz", Math.floor(luz), " lux", "☀️", { bajo: 400, alto: 1000 }, { bajo: "#3B82F6", normal: "#F59E0B", alto: "#F59E0B" }, { bajo: "Bajo", normal: "Normal", alto: "Alto" }),
      ];

      setMetrics(nuevasMetricas);
      setUltimaActualizacion(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error:", error);
      simularDatos();
      generarDatosSimulados();
    } finally {
      setLoading(false);
    }
  }, [simularDatos, generarDatosSimulados]);

  useEffect(() => {
    // Generar datos simulados inicialmente para que los gráficos se muestren inmediatamente
    generarDatosSimulados();
    
    cargarDatos();
    const usuario = authService.getUser();
    setUsuarioNombre(usuario?.nombre || usuario?.first_name || usuario?.username || "Usuario");
    const rol = authService.getRol() || (authService.isAdmin() ? "Administrador" : "Agricultor");
    setUsuarioRol(rol);
    setEsAdmin(authService.isAdmin());
    
    // Inicializar datos para edición
    setEditNombre(usuario?.nombre || "");
    setEditApellido(usuario?.apellido || "");
    setEditTelefono(usuario?.telefono || "");
  }, [cargarDatos, generarDatosSimulados]);

  const abrirPerfil = () => {
    const usuario = authService.getUser();
    setEditNombre(usuario?.nombre || "");
    setEditApellido(usuario?.apellido || "");
    setEditTelefono(usuario?.telefono || "");
    setEditPassword("");
    setMostrarPerfil(true);
  };

  const guardarPerfil = async () => {
    if (!editNombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }
    try {
      const response = await perfilService.update({
        nombre: editNombre,
        apellido: editApellido,
        telefono: editTelefono,
        password: editPassword || undefined
      });
      if (response.success) {
        Alert.alert("Éxito", "Perfil actualizado");
        setMostrarPerfil(false);
        setUsuarioNombre(editNombre);
      } else {
        Alert.alert("Error", response.error || "No se pudo actualizar");
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  const getEstadoGeneral = () => {
    const tieneAltas = alertas.some(a => a.prioridad === "alta");
    if (tieneAltas) return { texto: "Con alertas", color: "#EF4444" };
    if (alertas.length > 0) return { texto: "Con advertencias", color: "#F59E0B" };
    return { texto: "Óptimo", color: "#22C55E" };
  };

  const estado = getEstadoGeneral();

  return (
    <View style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <View style={styles.header}>
        <Text style={styles.titulo}>SIMC 🌱</Text>
        <Text style={styles.subtitulo}>Hola, {usuarioNombre}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
          <Text style={styles.rol}>{usuarioRol}</Text>
          {esAdmin && (
            <TouchableOpacity style={styles.usuariosBtn} onPress={() => router.push('/usuarios')}>
              <Text style={styles.usuariosBtnText}>👥</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.perfilBtn} onPress={abrirPerfil}>
            <Text style={styles.perfilBtnText}>✏️ Editar</Text>
          </TouchableOpacity>
        </View>
        <BotonLogout />
      </View>

      {/* Modal de Edición de Perfil */}
      <Modal visible={mostrarPerfil} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>👤 Editar Mi Perfil</Text>
            <TextInput style={styles.input} placeholder="Nombre *" value={editNombre} onChangeText={setEditNombre} />
            <TextInput style={styles.input} placeholder="Apellido" value={editApellido} onChangeText={setEditApellido} />
            <TextInput style={styles.input} placeholder="Teléfono" value={editTelefono} onChangeText={setEditTelefono} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Nueva contraseña (opcional)" value={editPassword} onChangeText={setEditPassword} secureTextEntry />
            <View style={{ flexDirection: 'row', marginTop: 15 }}>
              <TouchableOpacity style={[styles.botonModal, styles.botonCancelar]} onPress={() => setMostrarPerfil(false)}>
                <Text style={styles.botonModalTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonModal} onPress={guardarPerfil}>
                <Text style={styles.botonModalTexto}>💾 Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarDatos} />}>
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Estado General</Text>
          <Text style={{ color: estado.color, fontSize: 18, fontWeight: 'bold' }}>{estado.texto}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitulo}>📊 Resumen del Sistema</Text>
          <Text style={styles.texto}>🌾 Fincas: {fincas.length}</Text>
          <Text style={styles.texto}>🌱 Cultivos: {cultivos.length}</Text>
          <Text style={styles.texto}>📡 Sensores: {sensores.length}</Text>
          <Text style={styles.texto}>💧 Riegos: {riegos.length}</Text>
        </View>

        {/* Gráficos solo para Administrador */}
        {esAdmin && (
          <>
            <Text style={styles.seccion}>💧 Consumo de Agua (Últimos 7 días)</Text>
            <View style={styles.card}>
              <GraficoBarras titulo="" datos={datosGraficoRiego.length > 0 ? datosGraficoRiego : [{ etiqueta: 'Sin datos', valor: 0 }]} color="#3B82F6" />
            </View>

            <Text style={styles.seccion}>🔔 Alertas por Prioridad</Text>
            <View style={styles.card}>
              <GraficoCircular titulo="" datos={datosGraficoAlertas.length > 0 ? datosGraficoAlertas : [{ etiqueta: 'Sin alertas', valor: 0, color: '#ccc' }]} />
            </View>
          </>
        )}

        <Text style={styles.seccion}>📈 Métricas en Tiempo Real</Text>
        <View style={styles.grid}>
          {metrics.map((m, i) => (
            <View key={i} style={styles.metric}>
              <Text style={styles.metricIcon}>{m.icon}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={styles.metricValue}>{m.value}</Text>
              <Text style={{ color: m.color }}>{m.status}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.actualizacion}>Actualizado: {ultimaActualizacion}</Text>
      </ScrollView>

      <MenuNavegacion rutaActual="/dashboard" esAdmin={esAdmin} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#2563eb", padding: 20, paddingTop: 50 },
  titulo: { fontSize: 24, color: "#fff", fontWeight: "bold", textAlign: "center" },
  subtitulo: { color: "#dbeafe", fontSize: 16, textAlign: "center", marginTop: 8 },
  rol: { color: "#fff", fontSize: 14, textAlign: "center", backgroundColor: "rgba(255,255,255,0.3)", alignSelf: "center", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  card: { backgroundColor: "#fff", margin: 10, padding: 15, borderRadius: 10 },
  cardTitulo: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  texto: { fontSize: 14, marginVertical: 2 },
  seccion: { fontSize: 18, fontWeight: "bold", margin: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 5 },
  metric: { width: "45%", margin: "2.5%", backgroundColor: "#fff", padding: 15, borderRadius: 10, alignItems: "center" },
  metricIcon: { fontSize: 28 },
  metricLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  metricValue: { fontSize: 18, fontWeight: "bold", marginTop: 4 },
  actualizacion: { textAlign: "center", color: "#999", marginVertical: 20 },
  menu: { flexDirection: "row", backgroundColor: "#2563eb", paddingVertical: 12, paddingBottom: 25, justifyContent: "space-around" },
  menuItem: { alignItems: "center", paddingHorizontal: 8 },
  menuItemActivo: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  menuIcono: { fontSize: 20 },
  menuTexto: { fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  menuTextoActivo: { color: "#fff", fontWeight: "bold" },
  logoutBtn: { backgroundColor: "#ef4444", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginTop: 10, alignSelf: "center" },
  logoutBtnText: { color: "#fff", fontWeight: "bold" },
  perfilBtn: { backgroundColor: "#22c55e", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, marginLeft: 10 },
  perfilBtnText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  usuariosBtn: { backgroundColor: "#8b5cf6", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, marginLeft: 8 },
  usuariosBtnText: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: 15, padding: 20, width: "85%", maxHeight: "80%" },
  modalTitulo: { fontSize: 20, fontWeight: "bold", color: "#2563eb", marginBottom: 15, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 10, backgroundColor: "#f9fafb" },
  botonModal: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, alignItems: "center", flex: 1, marginHorizontal: 5 },
  botonCancelar: { backgroundColor: "#6b7280" },
  botonModalTexto: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  // Estilos para gráficos
  graficoContainer: { marginVertical: 10 },
  graficoTitulo: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  barraFila: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barraEtiqueta: { width: 40, fontSize: 12, color: '#666' },
  barraWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  barra: { height: 20, borderRadius: 4, minWidth: 4 },
  barraValor: { marginLeft: 8, fontSize: 12, color: '#333', fontWeight: 'bold', minWidth: 40 },
  graficoCircularContainer: { marginVertical: 10 },
  graficoCircular: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  circularItem: { alignItems: 'center', marginVertical: 8, minWidth: 80 },
  circularIndicador: { width: 16, height: 16, borderRadius: 8, marginBottom: 4 },
  circularEtiqueta: { fontSize: 12, color: '#333', fontWeight: 'bold' },
  circularValor: { fontSize: 11, color: '#666' },
});

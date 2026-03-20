import { Link } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        
        {/* Logo */}
        <Text style={styles.logo}>🌱</Text>

        {/* Títulos */}
        <Text style={styles.title}>Sistema Inteligente</Text>
        <Text style={styles.subtitle}>Monitoreo de Cultivos</Text>

        {/* Características */}
        <View style={styles.features}>
          <FeatureItem icon="💧" text="Control de Humedad" />
          <FeatureItem icon="🌡️" text="Monitoreo de Temperatura" />
          <FeatureItem icon="📡" text="Sensores en Tiempo Real" />
        </View>

        {/* Botón */}
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.button} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Comenzar</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>© 2026 Sistema de Cultivos</Text>
    </View>
  );
}

/* ================= COMPONENTE REUTILIZABLE ================= */
function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

/* ================= ESTILOS ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2563eb",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  logo: {
    fontSize: 90,
    marginBottom: 10,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 16,
    color: "#dcfce7",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 30,
  },

  features: {
    width: "100%",
    marginBottom: 30,
    gap: 10,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 14,
  },

  featureIcon: {
    fontSize: 26,
    marginRight: 12,
  },

  featureText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
  },

  button: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 30,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },

  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  footer: {
    textAlign: "center",
    color: "#dcfce7",
    paddingBottom: 20,
    fontSize: 12,
  },
});
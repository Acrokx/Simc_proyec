import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CardCultivoProps {
  nombre: string;
  tipo: string;
  estado: string;
  humedad: number;
  temperatura: number;
  onPress?: () => void;
}

export function CardCultivo({ 
  nombre, 
  tipo, 
  estado, 
  humedad, 
  temperatura,
  onPress 
}: CardCultivoProps) {
  const getEstadoColor = () => {
    switch (estado.toLowerCase()) {
      case "óptimo":
      case "optimo":
        return "#16a34a";
      case "advertencia":
        return "#f59e0b";
      case "crítico":
      case "critico":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.nombre}>{nombre}</Text>
        <Text style={[styles.estado, { color: getEstadoColor() }]}>
          {estado}
        </Text>
      </View>
      
      <Text style={styles.tipo}>{tipo}</Text>
      
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>💧 Humedad</Text>
          <Text style={styles.metricValue}>{humedad}%</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>🌡️ Temperatura</Text>
          <Text style={styles.metricValue}>{temperatura}°C</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  estado: {
    fontSize: 14,
    fontWeight: "600",
  },
  tipo: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  metric: {
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 2,
  },
});

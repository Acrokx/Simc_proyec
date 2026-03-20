import { StyleSheet, Text, View } from "react-native";

interface SensorItemProps {
  nombre: string;
  tipo: string;
  ubicacion: string;
  estado: "activo" | "inactivo" | "error";
  ultimoValor: number;
  unidad: string;
}

export function SensorItem({ 
  nombre, 
  tipo, 
  ubicacion, 
  estado, 
  ultimoValor,
  unidad 
}: SensorItemProps) {
  const getEstadoColor = () => {
    switch (estado) {
      case "activo":
        return "#16a34a";
      case "inactivo":
        return "#6b7280";
      case "error":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const getIcono = () => {
    switch (tipo.toLowerCase()) {
      case "humedad":
        return "💧";
      case "temperatura":
        return "🌡️";
      case "ph":
        return "🧪";
      case "luz":
        return "☀️";
      default:
        return "📡";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIcono()}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.nombre}>{nombre}</Text>
        <Text style={styles.tipo}>{tipo}</Text>
        <Text style={styles.ubicacion}>📍 {ubicacion}</Text>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>
          {ultimoValor}{unidad}
        </Text>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor() }]}>
          <Text style={styles.estadoText}>{estado}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  tipo: {
    fontSize: 14,
    color: "#6b7280",
  },
  ubicacion: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  valueContainer: {
    alignItems: "flex-end",
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
    textTransform: "capitalize",
  },
});

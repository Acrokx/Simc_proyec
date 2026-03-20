import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

const menuItems = [
  { title: "Dashboard", route: "/(tabs)/dashboard", color: "#3B82F6" },
  { title: "Fincas", route: "/(tabs)/fincas", color: "#10B981" },
  { title: "Cultivos", route: "/(tabs)/cultivos", color: "#22C55E" },
  { title: "Sensores", route: "/(tabs)/sensores", color: "#8B5CF6" },
  { title: "Mediciones", route: "/(tabs)/mediciones", color: "#F59E0B" },
  { title: "Alertas", route: "/(tabs)/alertas", color: "#EF4444" },
  { title: "Agricultores", route: "/(tabs)/usuarios", color: "#6366f1" },
];

export default function TopNavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen((o) => !o)}>
        <Text style={styles.triggerText}>☰ Menu</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={[styles.item, { borderLeftColor: item.color }]}
              onPress={() => {
                router.replace(item.route as any);
                setOpen(false);
              }}
            >
              <Text style={styles.itemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 10,
  },
  trigger: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    alignSelf: "flex-start",
  },
  triggerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  item: {
    padding: 12,
    borderLeftWidth: 5,
  },
  itemText: {
    fontSize: 14,
    color: "#1f2937",
  },
});

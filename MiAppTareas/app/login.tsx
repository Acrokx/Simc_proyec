import { useState } from "react";
import { router } from "expo-router";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { authService } from "./services/api";

export default function Login() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [ui, setUI] = useState({
    loading: false,
    showPassword: false,
    error: "",
  });

  /* ================= FUNCIONES ================= */

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (ui.error) setUI((prev) => ({ ...prev, error: "" }));
  };

  const validarFormulario = () => {
    if (!form.username.trim() || !form.password.trim()) {
      return "Todos los campos son obligatorios";
    }

    // Validación de contraseña más robusta
    if (form.password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }

    // Verificar que el username parezca un email válido
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.username.trim())) {
      return "Ingrese un correo electrónico válido";
    }

    return "";
  };

  const handleLogin = async () => {
    const errorMsg = validarFormulario();
    if (errorMsg) {
      setUI((prev) => ({ ...prev, error: errorMsg }));
      return;
    }

    setUI((prev) => ({ ...prev, loading: true, error: "" }));

    try {
      const response = await authService.login(
        form.username.trim(),
        form.password
      );

      if (response?.success) {
        router.replace("/dashboard");
      } else {
        setUI((prev) => ({
          ...prev,
          error: response?.message || "Credenciales incorrectas",
        }));
      }
    } catch (err) {
      console.error("Error login:", err);
      setUI((prev) => ({
        ...prev,
        error: "No se pudo conectar con el servidor",
      }));
    } finally {
      setUI((prev) => ({ ...prev, loading: false }));
    }
  };

  const togglePassword = () => {
    setUI((prev) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#eff6ff" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Header />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Iniciar sesión</Text>

            {ui.error ? <ErrorMessage message={ui.error} /> : null}

            {/* EMAIL */}
            <InputField
            label="Correo electrónico"
            placeholder="ejemplo@correo.com"
            value={form.username}
            onChangeText={(text: string) => handleChange("username", text)}
            keyboardType="email-address"
            />

            {/* PASSWORD */}
            <PasswordField
              value={form.password}
              showPassword={ui.showPassword}
              onChange={(text) => handleChange("password", text)}
              onToggle={togglePassword}
            />

            {/* BOTÓN */}
            <TouchableOpacity
              style={[
                styles.button,
                ui.loading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={ui.loading}
              activeOpacity={0.8}
            >
              {ui.loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Ingresar</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>© 2026 SIMC</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================= COMPONENTES ================= */

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Sistema de Cultivos</Text>
      <Text style={styles.subtitle}>
        Accede a tu plataforma de monitoreo
      </Text>
    </View>
  );
}

function InputField({
  label,
  ...props
}: {
  label: string;
  [key: string]: any;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        {...props}
      />
    </>
  );
}

function PasswordField({
  value,
  showPassword,
  onChange,
  onToggle,
}: {
  value: string;
  showPassword: boolean;
  onChange: (text: string) => void;
  onToggle: () => void;
}) {
  return (
    <>
      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
          secureTextEntry={!showPassword}
          value={value}
          onChangeText={onChange}
        />
        <TouchableOpacity onPress={onToggle}>
          <Text style={styles.eye}>
            {showPassword ? "Ocultar" : "Ver"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

/* ================= ESTILOS ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eff6ff",
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  header: {
    marginBottom: 25,
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2563eb",
  },

  subtitle: {
    fontSize: 13,
    color: "#3b82f6",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    width: "100%",
    maxWidth: 400,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },

  label: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f9fafb",
    marginBottom: 12,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    marginBottom: 12,
    paddingRight: 10,
  },

  passwordInput: {
    flex: 1,
    padding: 12,
  },

  eye: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },

  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  errorContainer: {
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },

  errorText: {
    color: "#dc2626",
    fontSize: 12,
    textAlign: "center",
  },

  footer: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 20,
    fontSize: 12,
  },
});
import { Stack } from "expo-router";
import { LogBox } from "react-native";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    LogBox.ignoreLogs([
      /.*shadow.*deprecated.*/,
      /.*pointerEvents.*deprecated.*/,
      /.*resizeMode.*deprecated.*/,
      /.*Animated:.*useNativeDriver.*/,
      /.*Image.*deprecated.*/,
    ]);
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="fincas" />
      <Stack.Screen name="cultivos" />
      <Stack.Screen name="riegos" />
      <Stack.Screen name="sensores" />
      <Stack.Screen name="mediciones" />
      <Stack.Screen name="alertas" />
      <Stack.Screen name="usuarios" />
      <Stack.Screen name="perfil" />
    </Stack>
  );
}

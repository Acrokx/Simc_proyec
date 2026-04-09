# SIMC - Frontend (Expo/React Native)

Aplicación móvil del Sistema de Monitoreo de Cultivos desarrollada con Expo.

## 📱 Descripción

Interfaz de usuario para la gestión de fincas, cultivos, riegos, sensores, mediciones y alertas del sistema SIMC.

## 🚀 Inicio Rápido

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npx expo start

# Opcional: ejecutar en Android
npx expo start --android
```

### Requisitos

- Node.js 18+
- Expo Go (para probar en móvil)
- Expo CLI

## 📁 Estructura de Archivos

```
app/                          # Páginas principales (file-based routing)
├── login.tsx                 # Pantalla de inicio de sesión
├── dashboard.tsx             # Dashboard principal
├── fincas.tsx                # Gestión de fincas
├── cultivos.tsx              # Gestión de cultivos
├── riegos.tsx                # Registro de riegos
├── sensores.tsx              # Gestión de sensores
├── mediciones.tsx            # Registro de mediciones
├── alertas.tsx               # Gestión de alertas
├── usuarios.tsx              # Administración de usuarios (admin)
├── perfil.tsx               # Perfil del usuario
├── services/
│   └── api.ts               # Cliente API y servicios
└── _layout.tsx              # Configuración de navegación

components/                   # Componentes reutilizables
├── Button.tsx               # Botón personalizado
├── CardCultivo.tsx          # Tarjeta de cultivo
└── SensorItem.tsx           # Elemento de sensor

constants/
└── theme.ts                 # Configuración de tema y colores
```

## 🎨 Estilos y Temas

La aplicación utiliza:
- **Colores principales**: Azul (#2563eb), Verde (#22c55e), Rojo (#ef4444)
- **Estilos**: StyleSheet de React Native
- **Navegación**: Stack navigator con Expo Router

## 🔌 Integración con API

El frontend se conecta al backend en:
- **IP por defecto**: `172.31.0.183:8000/api`
- **Puerto**: 8000

Para modificar la URL, edita `app/services/api.ts` línea 31.

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Iniciar servidor Expo |
| `npm run android` | Ejecutar en Android |
| `npm run ios` | Ejecutar en iOS |
| `npm run web` | Ejecutar en navegador |
| `npm run lint` | Verificar código |

## 📋 Funcionalidades por Pantalla

### Login
- Validación de correo electrónico
- Validación de contraseña (mínimo 6 caracteres)
- Indicador de carga

### Dashboard
- Métricas en tiempo real (simuladas)
- Resumen del sistema (fincas, cultivos, sensores, riegos)
- Gráficos de consumo de agua y alertas (solo admin)
- Edición de perfil de usuario

### Gestión de Fincas
- Listado de fincas
- Crear nueva finca
- Editar/elimininar (solo admin)

### Gestión de Cultivos
- Listado de cultivos por finca
- Selector visual de finca
- Estado del cultivo

### Riegos
- Registro histórico de riegos
- Selector de cultivo
- Cantidad de agua en litros

### Sensores
- Gestión de sensores por cultivo
- Estado (Activo/Inactivo)
- Ubicación

### Mediciones
- Registro de mediciones por sensor
- Valores de humedad

### Alertas
- Notas/alertas por prioridad
- Selector visual de prioridad
- Marcar como leída

### Usuarios (Admin)
- Listado de agricultores
- Crear nuevo agricultor
- Editar/eliminar usuarios

## ⚠️ Notas de Desarrollo

- Los errores de linter en archivos `.py` son falsos positivos (el LSP no detecta el entorno virtual)
- La autenticación usa correo y contraseña
- Las métricas del dashboard son simuladas para demostración
- Los gráficos solo son visibles para administradores
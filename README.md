# SIMC - Sistema de Monitoreo de Cultivos y control de Humedad.

Sistema integral para la gestión y monitoreo de cultivos agrícolas, fincas, sensores y alertas en tiempo real.

## Descripción

SIMC es una aplicación móvil desarrollada con React Native (Expo) y un backend en Django que permite a agricultores y administradores gestionar fincas, cultivos, sistemas de riego, sensores de monitoreo y alertas de manera eficiente lo cual permitira un mejor manejo del los recursos hidricos.

### Características Principales

- **Gestión de Fincas**: Crear, editar y eliminar fincas con información detallada
- **Control de Cultivos**: Seguimiento de tipos de cultivo, fechas de siembra y estados
- **Sistema de Riegos**: Registro histórico de riegos por cultivo
- **Monitoreo de Sensores**: Control de sensores asociados a cultivos
- **Mediciones**: Registro y visualización de mediciones (humedad, temperatura, pH, luz)
- **Alertas**: Sistema de notificaciones por prioridad (alta, media, baja)
- **Gestión de Usuarios**: Administración de agricultores (solo administradores)
- **Dashboard**: Resumen visual con gráficos y métricas en tiempo real

## 🏗️ Arquitectura

```
SIMC/
├── backend_cultivos/          # Backend Django REST API
│   ├── config/                # Configuración del proyecto
│   ├── usuarios/              # App de usuarios
│   ├── cultivos/              # App de fincas, cultivos y riegos
│   ├── sensores/              # App de sensores
│   ├── mediciones/            # App de mediciones
│   └── alertas/               # App de alertas
│
└── MiAppTareas/               # Frontend React Native (Expo)
    ├── app/                   # Páginas y rutas
    │   ├── services/          # Servicios API
    │   └── components/        # Componentes reutilizables
    ├── components/            # Componentes UI
    ├── constants/             # Configuración y temas
    └── hooks/                 # Custom hooks
```

## Inicio Rápido

### Prerrequisitos

- **Backend**: Python 3.8+, Django 6.0, SQLite
- **Frontend**: Node.js 18+, npm/yarn, Expo Go (para móviles)

### Instalación del Backend

```bash
# Navegar al directorio del backend
cd backend_cultivos

# Crear entorno virtual (Windows)
python -m venv venv
venv\Scripts\activate

# Instalar dependencias
pip install django djangorestframework django-cors-headers

# Aplicar migraciones
python manage.py migrate

# Iniciar servidor
python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000`

### Instalación del Frontend

```bash
# Navegar al directorio del frontend
cd MiAppTareas

# Instalar dependencias
npm install

# Iniciar Expo (desarrollo)
npx expo start
```

Para ejecutar en dispositivo móvil:
1. Escanea el código QR con Expo Go (Android/iOS)
2. O usa un emulador de Android/iOS

##  Roles de Usuario

### Administrador
- Acceso completo a todas las funcionalidades
- Gestión de usuarios (agricultores)
- Ver gráficos y estadísticas en el dashboard
- Crear, editar y eliminar cualquier registro

### Agricultor
- Gestión de sus propias fincas, cultivos, riegos, sensores y mediciones
- Ver alertas del sistema
- Editar su propio perfil

##  Endpoints API

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/login/` | Iniciar sesión |
| POST | `/api/logout/` | Cerrar sesión |
| POST | `/api/registro/` | Registrar nuevo usuario |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios/` | Listar usuarios |
| GET | `/api/usuarios/perfil/` | Obtener perfil actual |
| PATCH | `/api/usuarios/perfil/` | Actualizar perfil |

### Fincas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/fincas/` | Listar fincas |
| POST | `/api/fincas/` | Crear finca |
| GET | `/api/fincas/{id}/` | Obtener detalles |
| PATCH | `/api/fincas/{id}/` | Actualizar finca |
| DELETE | `/api/fincas/{id}/` | Eliminar finca |

### Cultivos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cultivos/` | Listar cultivos |
| POST | `/api/cultivos/` | Crear cultivo |
| PATCH | `/api/cultivos/{id}/` | Actualizar cultivo |
| DELETE | `/api/cultivos/{id}/` | Eliminar cultivo |

### Riegos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/riegos/` | Listar riegos |
| POST | `/api/riegos/` | Registrar riego |
| PATCH | `/api/riegos/{id}/` | Actualizar riego |
| DELETE | `/api/riegos/{id}/` | Eliminar riego |

### Sensores
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/sensores/` | Listar sensores |
| POST | `/api/sensores/` | Crear sensor |
| PATCH | `/api/sensores/{id}/` | Actualizar sensor |
| DELETE | `/api/sensores/{id}/` | Eliminar sensor |

### Mediciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/mediciones/` | Listar mediciones |
| POST | `/api/mediciones/crear/` | Crear medición |
| DELETE | `/api/mediciones/{id}/` | Eliminar medición |

### Alertas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/alertas/` | Listar alertas |
| POST | `/api/alertas/crear/` | Crear alerta |
| GET | `/api/alertas/no-leidas/` | Obtener alertas no leídas |
| PATCH | `/api/alertas/{id}/` | Marcar como leída |
| DELETE | `/api/alertas/{id}/` | Eliminar alerta |

##  Configuración

### Frontend - URL del API

La aplicación frontend está configurada para conectarse al backend en:
- **Desarrollo**: `http://172.31.0.183:8000/api`
- La IP puede variar según la red local

Para cambiar la URL del API, edita `MiAppTareas/app/services/api.ts`:

```typescript
// Línea 31: Cambiar la URL de fallback
return 'http://TU_IP:8000/api';
```

### Backend - Configuración CORS

El backend permite todas las origenes CORS para desarrollo. En producción, modifica `backend_cultivos/config/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://tu-dominio.com",
]
```

## 🔧 Tecnologías

### Frontend
- **Framework**: React Native con Expo
- **Lenguaje**: TypeScript
- **Navegación**: Expo Router
- **HTTP Client**: Axios
- **Estilos**: StyleSheet (React Native)

### Backend
- **Framework**: Django 6.0
- **API**: Django REST Framework
- **Base de datos**: SQLite (desarrollo)
- **CORS**: django-cors-headers

##  Licencia

Este proyecto es para fines educativos y de desarrollo.

##  Autores

- Desarrollo: SIMC Team
- Año: 2026
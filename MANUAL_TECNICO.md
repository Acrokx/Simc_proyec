# MANUAL TÉCNICO - SIMC

## Sistema de Monitoreo de Cultivos y Control de Humedad

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Proyecto:** SIMC

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
Este documento describe la arquitectura técnica, estructura del sistema, tecnologías utilizadas y detalles de implementación del sistema SIMC.

### 1.2 Alcance
SIMC es una aplicación móvil con backend web para la gestión integral de cultivos agrícolas, incluyendo gestión de fincas, cultivos, riegos, sensores, mediciones de humedad y alertas.

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Arquitectura General
```
┌─────────────────────────────────────────────────────────────┐
│                    APLICACIÓN MÓVIL                         │
│                    (React Native / Expo)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                              │
│                    (Django REST Framework)                  │
│                         Puerto: 8000                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                            │
│                    (SQLite)                                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Componentes

| Componente | Tecnología | Función |
|------------|------------|---------|
| Frontend Móvil | React Native + Expo | Interfaz de usuario |
| Backend API | Django 6.0 + DRF | Lógica de negocio y API REST |
| Base de Datos | SQLite | Almacenamiento de datos |
| Protocolo | HTTP/REST | Comunicación cliente-servidor |

---

## 3. ESTRUCTURA DEL PROYECTO

### 3.1 Directorio Principal
```
SIMC/
├── backend_cultivos/          # Backend Django
│   ├── config/                # Configuración del proyecto
│   │   ├── settings.py        # Configuraciones principales
│   │   ├── urls.py            # Rutas principales
│   │   ├── wsgi.py            # Configuración WSGI
│   │   └── asgi.py            # Configuración ASGI
│   ├── usuarios/              # App de usuarios
│   │   ├── models.py          # Modelo Usuario
│   │   ├── views.py           # Vistas de autenticación
│   │   ├── serializers.py     # Serializadores
│   │   └── urls.py            # Rutas de usuarios
│   ├── cultivos/              # App de cultivos
│   │   ├── models.py          # Modelos Finca, Cultivo, HistorialRiego
│   │   ├── views.py           # Vistas y ViewSets
│   │   ├── serializers.py     # Serializadores
│   │   └── urls.py            # Rutas de cultivos
│   ├── sensores/              # App de sensores
│   │   ├── models.py          # Modelo Sensor
│   │   ├── views.py           # Vistas
│   │   ├── serializers.py     # Serializadores
│   │   └── urls.py            # Rutas de sensores
│   ├── mediciones/            # App de mediciones
│   │   ├── models.py          # Modelo Medicion
│   │   ├── views.py           # Vistas
│   │   ├── serializers.py     # Serializadores
│   │   └── urls.py            # Rutas de mediciones
│   ├── alertas/               # App de alertas
│   │   ├── models.py          # Modelo Alerta
│   │   ├── views.py           # Vistas
│   │   ├── serializers.py     # Serializadores
│   │   └── urls.py            # Rutas de alertas
│   ├── db.sqlite3             # Base de datos SQLite
│   ├── manage.py              # Utilitario Django
│   └── venv/                  # Entorno virtual Python
│
└── MiAppTareas/               # Frontend React Native (Expo)
    ├── app/                   # Páginas y rutas (Expo Router)
    │   ├── _layout.tsx        # Layout principal
    │   ├── index.tsx          # Página de inicio/login
    │   ├── login.tsx          # Página de inicio de sesión
    │   ├── dashboard.tsx      # Dashboard principal
    │   ├── fincas.tsx         # Gestión de fincas
    │   ├── cultivos.tsx       # Gestión de cultivos
    │   ├── riegos.tsx         # Gestión de riegos
    │   ├── sensores.tsx       # Gestión de sensores
    │   ├── mediciones.tsx     # Mediciones
    │   ├── alertas.tsx        # Alertas
    │   ├── usuarios.tsx       # Gestión de usuarios
    │   ├── perfil.tsx         # Perfil de usuario
    │   └── services/
    │       └── api.ts         # Configuración de API
    ├── package.json           # Dependencias Node.js
    ├── tsconfig.json          # Configuración TypeScript
    ├── tailwind.config.js     # Configuración Tailwind
    └── node_modules/          # Dependencias instaladas
```

---

## 4. MODELOS DE DATOS

### 4.1 Modelo Usuario
**Tabla:** `usuario`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_usuario | AutoField | Identificador único |
| nombre | CharField(100) | Nombre del usuario |
| apellido | CharField(100) | Apellido del usuario |
| correo | EmailField(100) | Correo electrónico (único) |
| contraseña | CharField(255) | Contraseña encriptada |
| telefono | CharField(20) | Teléfono de contacto |
| rol | CharField(20) | Rol: Administrador o Agricultor |
| fecha_registro | DateField | Fecha de registro automático |

### 4.2 Modelo Finca
**Tabla:** `finca`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_finca | AutoField | Identificador único |
| nombre_finca | CharField(100) | Nombre de la finca |
| ubicacion | CharField(150) | Ubicación geográfica |
| tamaño_hectareas | DecimalField(10,2) | Tamaño en hectáreas |
| descripcion | TextField | Descripción opcional |
| id_usuario | ForeignKey | Usuario propietario |

### 4.3 Modelo Cultivo
**Tabla:** `cultivo`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_cultivo | AutoField | Identificador único |
| tipo_cultivo | CharField(100) | Tipo de cultivo |
| fecha_siembra | DateField | Fecha de siembra |
| estado | CharField(50) | Estado del cultivo |
| id_finca | ForeignKey | Finca asociada |

### 4.4 Modelo HistorialRiego
**Tabla:** `historial_riego`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_riego | AutoField | Identificador único |
| fecha_riego | DateField | Fecha del riego |
| cantidad_agua | DecimalField(10,2) | Cantidad de agua en litros |
| id_cultivo | ForeignKey | Cultivo relacionado |

### 4.5 Modelo Sensor
**Tabla:** `sensor`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_sensor | AutoField | Identificador único |
| tipo_sensor | CharField(50) | Tipo de sensor |
| ubicacion | CharField(100) | Ubicación del sensor |
| estado | CharField(50) | Estado del sensor |
| id_cultivo | ForeignKey | Cultivo monitoreado |

### 4.6 Modelo Medicion
**Tabla:** `medicion`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_medicion | AutoField | Identificador único |
| valor_humedad | DecimalField(6,2) | Valor de humedad (%) |
| fecha_medicion | DateTimeField | Fecha y hora de medición |
| id_sensor | ForeignKey | Sensor que generó la medición |

### 4.7 Modelo Alerta
**Tabla:** `alerta`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_alerta | AutoField | Identificador único |
| tipo_alerta | CharField(50) | Tipo de alerta |
| descripcion | TextField | Descripción del mensaje |
| fecha_alerta | DateTimeField | Fecha de creación automática |
| prioridad | CharField(20) | Prioridad: alta, media, baja |
| leida | BooleanField | Indicador de lectura |
| id_medicion | ForeignKey | Medición relacionada (opcional) |

---

## 5. API REST - ENDPOINTS

### 5.1 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/login/` | Iniciar sesión |
| POST | `/api/logout/` | Cerrar sesión |
| POST | `/api/registro/` | Registrar nuevo usuario |

### 5.2 Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios/` | Listar usuarios |
| GET | `/api/usuarios/perfil/` | Obtener perfil actual |
| PATCH | `/api/usuarios/perfil/` | Actualizar perfil |

### 5.3 Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard/` | Obtener estadísticas del dashboard |

### 5.4 Fincas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/fincas/` | Listar fincas |
| POST | `/api/fincas/` | Crear finca |
| GET | `/api/fincas/{id}/` | Obtener detalles |
| PATCH | `/api/fincas/{id}/` | Actualizar finca |
| DELETE | `/api/fincas/{id}/` | Eliminar finca |

### 5.5 Cultivos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cultivos/` | Listar cultivos |
| POST | `/api/cultivos/` | Crear cultivo |
| GET | `/api/cultivos/{id}/` | Obtener detalles |
| PATCH | `/api/cultivos/{id}/` | Actualizar cultivo |
| DELETE | `/api/cultivos/{id}/` | Eliminar cultivo |

### 5.6 Riegos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/riegos/` | Listar riegos |
| POST | `/api/riegos/` | Registrar riego |
| PATCH | `/api/riegos/{id}/` | Actualizar riego |
| DELETE | `/api/riegos/{id}/` | Eliminar riego |

### 5.7 Sensores

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/sensores/` | Listar sensores |
| POST | `/api/sensores/` | Crear sensor |
| PATCH | `/api/sensores/{id}/` | Actualizar sensor |
| DELETE | `/api/sensores/{id}/` | Eliminar sensor |

### 5.8 Mediciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/mediciones/` | Listar mediciones |
| POST | `/api/mediciones/crear/` | Crear medición |
| GET | `/api/mediciones/ultima/` | Última medición por sensor |
| DELETE | `/api/mediciones/{id}/` | Eliminar medición |

### 5.9 Alertas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/alertas/` | Listar alertas |
| POST | `/api/alertas/crear/` | Crear alerta |
| GET | `/api/alertas/no-leidas/` | Obtener alertas no leídas |
| PATCH | `/api/alertas/marcar-leida/{id}/` | Marcar como leída |
| POST | `/api/alertas/crear-automatica/` | Crear alerta automática |
| DELETE | `/api/alertas/{id}/` | Eliminar alerta |

---

## 6. CONFIGURACIÓN

### 6.1 Backend - settings.py

**Configuración Principal:**
- **DEBUG:** True (desarrollo)
- **ALLOWED_HOSTS:** localhost, 127.0.0.1, 172.31.0.180, 10.0.2.2, *
- **LANGUAGE_CODE:** es-co
- **TIME_ZONE:** America/Bogota

**Apps Instaladas:**
- django.contrib.admin
- django.contrib.auth
- django.contrib.contenttypes
- django.contrib.sessions
- django.contrib.messages
- django.contrib.staticfiles
- rest_framework
- corsheaders
- usuarios
- cultivos
- sensores
- mediciones
- alertas

**Base de Datos:**
- ENGINE: django.db.backends.sqlite3
- NAME: BASE_DIR / 'db.sqlite3'

### 6.2 Frontend - API Configuration

**Archivo:** `MiAppTareas/app/services/api.ts`

La aplicación móvil está configurada para conectarse al backend en:
- **Desarrollo:** `http://172.31.0.183:8000/api`
- La IP debe coincidir con la red local donde se ejecuta el backend

---

## 7. ROLES DE USUARIO

### 7.1 Administrador
- Acceso completo a todas las funcionalidades
- Gestión de usuarios (agricultores)
- Ver gráficos y estadísticas en el dashboard
- Crear, editar y eliminar cualquier registro

### 7.2 Agricultor
- Gestión de sus propias fincas, cultivos, riegos, sensores y mediciones
- Ver alertas del sistema
- Editar su propio perfil

---

## 8. TECNOLOGÍAS UTILIZADAS

### 8.1 Frontend
| Tecnología | Versión |
|------------|---------|
| React Native | 0.81.5 |
| Expo | 54.0.33 |
| TypeScript | 5.9.2 |
| Expo Router | 6.0.23 |
| Axios | 1.13.6 |
| NativeWind | 4.2.3 |
| TailwindCSS | 3.4.19 |

### 8.2 Backend
| Tecnología | Versión |
|------------|---------|
| Django | 6.0.3 |
| Django REST Framework | - |
| Python | 3.8+ |
| SQLite | - |
| django-cors-headers | - |

---

## 9. INSTALACIÓN Y DESPLIEGUE

### 9.1 Requisitos Previos
- **Backend:** Python 3.8+, pip
- **Frontend:** Node.js 18+, npm
- **Móvil:** Expo Go (Android/iOS)

### 9.2 Configuración del Backend
```bash
cd backend_cultivos
python -m venv venv
venv\Scripts\activate
pip install django djangorestframework django-cors-headers
python manage.py migrate
python manage.py runserver
```
**Puerto:** 8000

### 9.3 Configuración del Frontend
```bash
cd MiAppTareas
npm install
npx expo start
```
Escanear código QR con Expo Go o usar emulador.

---

## 10. SEGURIDAD

### 10.1 Autenticación
- Sesiones basadas en cookies (Django SessionAuthentication)
- Contraseñas almacenadas encriptadas

### 10.2 CORS
- Configuración actual: CORS_ALLOW_ALL_ORIGINS = True (desarrollo)
- Para producción, configurar CORS_ALLOWED_ORIGINS específicamente

### 10.3 Recomendaciones para Producción
1. Cambiar SECRET_KEY en settings.py
2. Configurar DEBUG = False
3. Especificar dominios permitidos en CORS
4. Usar HTTPS
5. Configurar base de datos PostgreSQL o MySQL

---

## 11. DIAGRAMAS DE RELACIONES

```
Usuario (1) ──────< (N) Finca
                           │
                           ▼
                     (1) Finca ──────< (N) Cultivo
                                              │
                                              ▼
                                        (1) Cultivo ──────< (N) Sensor
                                                              │
                                                              ▼
                                                        (1) Sensor ──────< (N) Medicion
                                                                                │
                                                                                ▼
                                                                          (1) Medicion ──────< (N) Alerta
```

---

## 12. GLOSARIO

| Término | Descripción |
|---------|-------------|
| API | Application Programming Interface |
| Backend | Servidor y lógica de negocio |
| CRUD | Create, Read, Update, Delete |
| DRF | Django REST Framework |
| Endpoint | URL específica de la API |
| ForeignKey | Relación de clave foránea en Django |
| REST | Representational State Transfer |
| ViewSet | Clase de Django REST Framework para CRUD |
| Serializador | Transformación entre modelos y JSON |
| Expo | Framework para desarrollo React Native |

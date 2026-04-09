# MANUAL DE USUARIO - SIMC

## Sistema de Monitoreo de Cultivos y Control de Humedad

**Versión:** 1.0   \
**Fecha:** Abril 2026   \
**Proyecto:** SIMC

---

## 1. INTRODUCCIÓN

### 1.1 Acerca de SIMC

SIMC es una aplicación móvil diseñada para que agricultores y administradores puedan gestionar fincas, cultivos, sistemas de riego, sensores de monitoreo y alertas de manera eficiente, permitiendo un mejor manejo de los recursos hídricos.

### 1.2 Requisitos del Sistema

**Para dispositivo móvil:**
- Android 6.0+ o iOS 13+
- Expo Go instalado (disponible en Play Store o App Store)

**Para el servidor (opcional - funciona con datos de demostración):**
- Python 3.8+
- Django 6.0

---

## 2. INICIO DE SESIÓN

### 2.1 Acceso a la Aplicación

1. Abre la aplicación SIMC en tu dispositivo móvil
2. En la pantalla de inicio, ingresa tu **correo electrónico** en el campo correspondiente
3. Ingresa tu **contraseña**
4. Presiona el botón **"Ingresar"**

### 2.2 Credenciales de Acceso

Las credenciales las proporciona el administrador del sistema. Cada usuario debe tener:
- Un correo electrónico válido
- Una contraseña (mínimo 6 caracteres)

### 2.3 Recuperar Contraseña

Si olvidas tu contraseña, contacta al administrador del sistema para que te asigne una nueva.

---

## 3. PANTALLA PRINCIPAL (DASHBOARD)

### 3.1 Estructura del Dashboard

Al iniciar sesión, verás la pantalla principal que contiene:

**Encabezado:**
- Nombre de la aplicación: SIMC 🌱
- Saludo personalizado con tu nombre
- Tu rol (Administrador o Agricultor)
- Botón para editar perfil
- Botón para cerrar sesión

**Estado General:**
- Muestra el estado actual del sistema (Óptimo, Con advertencias, Con alertas)

**Resumen del Sistema:**
- Cantidad de fincas registradas
- Cantidad de cultivos
- Cantidad de sensores
- Cantidad de riegos registrados

**Métricas en Tiempo Real:**
- Humedad (%): Muestra el nivel de humedad actual
- Temperatura (°C): Muestra la temperatura ambiente
- pH: Muestra el nivel de pH del suelo
- Luz (lux): Muestra la intensidad luminosa

**Gráficos (solo Administrador):**
- Consumo de agua (últimos 7 días)
- Alertas por prioridad

### 3.2 Menú de Navegación

En la parte inferior de la pantalla encontraras un menú con las siguientes opciones:

| Icono | Función |
|-------|---------|
| 🏠 Inicio | Pantalla principal |
| 🌾 Fincas | Gestión de fincas |
| 🌱 Cultivos | Gestión de cultivos |
| 💧 Riegos | Registro de riegos |
| 📡 Sensores | Gestión de sensores |
| 📈 Mediciones | Ver mediciones |
| 🔔 Alertas | Ver alertas |
| 👥 Usuarios | Gestionar usuarios (solo admin) |

---

## 4. GESTIÓN DE FINCAS

### 4.1 Crear una Finca

1. Navega al menú **Fincas**
2. Presiona el botón **"+"** o **"Nueva Finca"**
3. Completa los siguientes datos:
   - **Nombre de la finca:** Nombre identificador
   - **Ubicación:** Dirección o ubicación geográfica
   - **Tamaño (hectáreas):** Superficie de la finca
   - **Descripción:** Información adicional (opcional)
4. Presiona **"Guardar"**

### 4.2 Ver Detalles de una Finca

1. En la lista de fincas, presiona sobre la finca deseada
2. Podrás ver todos los detalles y los cultivos asociados

### 4.3 Editar una Finca

1. Presiona sobre la finca a editar
2. Modifica los campos deseados
3. Presiona **"Guardar"**

### 4.4 Eliminar una Finca

1. Presiona sobre la finca a eliminar
2. Presiona el botón de **eliminar** o **basura**
3. Confirma la eliminación

---

## 5. GESTIÓN DE CULTIVOS

### 5.1 Crear un Cultivo

1. Navega al menú **Cultivos**
2. Presiona el botón **"+"** o **"Nuevo Cultivo"**
3. Completa los siguientes datos:
   - **Tipo de cultivo:** Nombre del cultivo (ej: Maíz, Café, etc.)
   - **Fecha de siembra:** Selecciona la fecha
   - **Finca:** Selecciona la finca donde se sembrará
   - **Estado:** Estado actual del cultivo
4. Presiona **"Guardar"**

### 5.2 Estados de Cultivo

Los cultivos pueden tener los siguientes estados:
- Siembra
- Crecimiento
- Producción
- Cosecha
- Descanso

### 5.3 Gestionar Cultivos

- **Ver:** Toca el cultivo para ver sus detalles
- **Editar:** Modifica los datos del cultivo
- **Eliminar:** Elimina el cultivo del sistema

---

## 6. GESTIÓN DE RIEGOS

### 6.1 Registrar un Riego

1. Navega al menú **Riegos**
2. Presiona el botón **"+"** o **"Nuevo Riego"**
3. Completa los datos:
   - **Cultivo:** Selecciona el cultivo regado
   - **Fecha de riego:** Fecha de la aplicación
   - **Cantidad de agua:** Cantidad en litros
4. Presiona **"Guardar"**

### 6.2 Historial de Riegos

En la pantalla principal de riegos puedes ver:
- Lista de todos los riegos registrados
- Fecha de cada riego
- Cantidad de agua utilizada
- Cultivo asociado

---

## 7. GESTIÓN DE SENSORES

### 7.1 Crear un Sensor

1. Navega al menú **Sensores**
2. Presiona el botón **"+"** o **"Nuevo Sensor"**
3. Completa los datos:
   - **Tipo de sensor:** Tipo de sensor (humedad, temperatura, pH, luz)
   - **Ubicación:** Ubicación dentro del cultivo
   - **Cultivo:** Selecciona el cultivo a monitorear
   - **Estado:** Estado del sensor (Activo, Inactivo, Mantenimiento)
4. Presiona **"Guardar"**

### 7.2 Tipos de Sensores

- **Humedad:** Mide el nivel de humedad del suelo
- **Temperatura:** Mide la temperatura ambiente
- **pH:** Mide el nivel de acidez del suelo
- **Luz:** Mide la intensidad luminosa

---

## 8. MEDICIONES

### 8.1 Ver Mediciones

1. Navega al menú **Mediciones**
2. Podrás ver una lista de todas las mediciones registradas
3. Cada medición muestra:
   - Valor de humedad
   - Fecha y hora
   - Sensor que realizó la medición

### 8.2 Registrar una Medición

1. En la pantalla de mediciones, presiona **"+"**
2. Selecciona el **sensor** que realizará la medición
3. Ingresa el **valor de humedad**
4. La fecha se registrará automáticamente
5. Presiona **"Guardar"**

---

## 9. ALERTAS

### 9.1 Tipos de Alertas

Las alertas se clasifican por **prioridad**:

| Prioridad | Color | Significado |
|-----------|-------|-------------|
| Alta | 🔴 Rojo | Requiere atención inmediata |
| Media | 🟡 Amarillo | Requiere atención pronto |
| Baja | 🟢 Verde | Información general |

### 9.2 Ver Alertas

1. Navega al menú **Alertas**
2. Verás el listado de todas las alertas
3. Las alertas no leídas se muestran con formato diferente

### 9.3 Marcar Alerta como Leída

1. Toca sobre una alerta
2. Presiona el botón para **marcar como leída**
3. La alerta cambiará de estado

### 9.4 Crear Alerta Manual

1. En la pantalla de alertas, presiona **"+"**
2. Completa:
   - **Tipo de alerta:** Selecciona el tipo
   - **Descripción:** Detalle de la alerta
   - **Prioridad:** Nivel de prioridad
3. Presiona **"Guardar"**

---

## 10. GESTIÓN DE USUARIOS (Solo Administrador)

### 10.1 Ver Lista de Usuarios

1. Navega al menú **Usuarios** (disponible solo para administradores)
2. Verás la lista de todos los usuarios registrados

### 10.2 Crear un Usuario

1. Presiona el botón **"+"**
2. Completa los datos:
   - **Nombre:** Nombre del usuario
   - **Apellido:** Apellido del usuario
   - **Correo:** Correo electrónico único
   - **Contraseña:** Contraseña inicial
   - **Teléfono:** Número de contacto
   - **Rol:** Administrador o Agricultor
3. Presiona **"Guardar"**

### 10.3 Editar Usuario

1. Toca sobre el usuario a modificar
2. Cambia los datos necesarios
3. Presiona **"Guardar"**

### 10.4 Eliminar Usuario

1. Toca sobre el usuario a eliminar
2. Presiona el botón de eliminar
3. Confirma la acción

---

## 11. PERFIL DE USUARIO

### 11.1 Editar Perfil

1. En el dashboard, presiona el botón **"✏️ Editar"**
2. Se abrirá un formulario donde puedes modificar:
   - Nombre
   - Apellido
   - Teléfono
   - Nueva contraseña (opcional)
3. Presiona **"Guardar"**

### 11.2 Cerrar Sesión

1. Presiona el botón **"🚪 Salir"** en el encabezado
2. Serás redirigido a la pantalla de inicio de sesión

---

## 12. ROLES DE USUARIO

### 12.1 Administrador

- ✅ Acceso completo a todas las funcionalidades
- ✅ Gestión de usuarios (agricultores)
- ✅ Ver gráficos y estadísticas en el dashboard
- ✅ Crear, editar y eliminar cualquier registro

### 12.2 Agricultor

- ✅ Gestión de sus propias fincas, cultivos, riegos, sensores y mediciones
- ✅ Ver alertas del sistema
- ✅ Editar su propio perfil

---

## 13. SOLUCIÓN DE PROBLEMAS

### 13.1 No puedo iniciar sesión

- Verifica que el correo electrónico sea correcto
- Verifica que la contraseña sea correcta (mínimo 6 caracteres)
- Asegúrate de tener conexión a internet
- Verifica que el servidor backend esté funcionando

### 13.2 No veo los gráficos en el dashboard

- Los gráficos de consumo de agua y alertas solo son visibles para usuarios con rol Administrador

### 13.3 No puedo crear registros

- Verifica que todos los campos obligatorios estén completos
- Algunos registros requieren tener datos previamente (ej: para crear un cultivo necesitas una finca)

### 13.4 La aplicación no conecta con el servidor

- Verifica que tu dispositivo esté en la misma red que el servidor
- Verifica que la IP del servidor sea correcta en la configuración
- Reinicia la aplicación

### 13.5 Datos de demostración

Si no hay conexión con el servidor, la aplicación mostrará datos de demostración (simulados) para que puedas explorar las funcionalidades.

---

## 14. GLOSARIO

| Término | Descripción |
|---------|-------------|
| Dashboard | Pantalla principal con resumen y métricas |
| Finca | Terreno agrícola registrado en el sistema |
| Cultivo | Planta sembrada en una finca |
| Riego | Aplicación de agua a un cultivo |
| Sensor | Dispositivo que mide condiciones del ambiente |
| Medición | Registro de un valor tomadas por un sensor |
| Alerta | Notificación sobre condiciones anormales |
| Prioridad | Nivel de importancia de una alerta |

---

## 15. CONTACTO Y SOPORTO

Para reportar problemas o solicitar ayuda:

- **Correo:** soporte@simc.com
- **Teléfono:** [Número de contacto]
- **sitio web:** www.simc.com

---

© 2026 SIMC - Sistema de Monitoreo de Cultivos y Control de Humedad

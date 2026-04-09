import axios from 'axios';
import Constants from 'expo-constants';

// URL base de la API
// Configurable via EXPO_PUBLIC_API_URL environment variable
const getApiUrl = () => {
  // Usa variable de entorno si existe (recomendado para producción)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Intenta obtener host desde Expo (desarrollo)
  try {
    const hostFromConfig =
      Constants.manifest?.debuggerHost ||
      (Constants as any).manifest2?.debuggerHost ||
      Constants.manifest?.packagerOpts?.host;

    if (hostFromConfig) {
      const host = hostFromConfig.split(':')[0];
      return `http://${host}:8000/api`;
    }
  } catch {
    // Ignora errores
  }

  // Fallback para desarrollo local
  return 'http://172.31.0.200:8000/api';
};

const API_URL = getApiUrl();

// Variable global para almacenar datos del usuario
let userData: any = null;

// Función para obtener el token
const getToken = () => userData?.token || userData?.access_token;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para agregar token a cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas de error (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró (401) y no hemos intentado reintentar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar refresh del token si existe
        const refreshToken = userData?.refresh_token;
        if (refreshToken) {
          const response = await api.post('/token/refresh/', {
            refresh: refreshToken,
          });

          if (response.data.access) {
            userData.token = response.data.access;
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return api(originalRequest);
          }
        }
    } catch {
      // Refresh falló, limpiar datos de usuario
      userData = null;
    }
    }

    return Promise.reject(error);
  }
);

// Servicio de autenticación
export const authService = {
  login: async (username: string, password: string) => {
    try {
      // Limpiar cualquier dato de sesión anterior
      userData = null;
      
      // Enviar como password para compatibilidad
      const response = await api.post('/login/', { 
        correo: username, 
        password: password,
        contraseña: password  // Enviar ambos para asegurar
      });
      
      if (response.data.success) {
        userData = response.data;
      }
      return response.data;
    } catch (error: any) {
      // Si el error es 401, verificar si hay sesión activa que cause problemas
      if (error.response?.status === 401) {
        // Reintentar sin sesión
        const newApi = axios.create({
          baseURL: API_URL,
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        });
        const retryResponse = await newApi.post('/login/', { 
          correo: username, 
          password: password,
          contraseña: password
        });
        if (retryResponse.data.success) {
          userData = retryResponse.data;
        }
        return retryResponse.data;
      }
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await api.post('/logout/');
    } catch {
      console.log('Logout API call failed, continuing with local logout');
    }
    userData = null;
  },
  
  getUserData: () => userData,
  
  isAdmin: () => {
    const role = userData?.usuario?.rol || userData?.perfil?.rol;
    return typeof role === 'string' && role.toLowerCase() === 'administrador';
  },

  getUser: () => userData?.usuario || userData?.user,

  getRol: () => {
    return userData?.usuario?.rol || userData?.perfil?.rol;
  },
  
  registro: async (data: any) => {
    // Transformar datos para el backend
    const registroData = {
      username: data.username || data.correo,
      correo: data.correo,
      password: data.contraseña || data.password,
      nombre: data.nombre,
      apellido: data.apellido,
      rol: data.rol || 'agricultor',
      telefono: data.telefono || ''
    };
    const response = await api.post('/registro/', registroData);
    return response.data;
  },
};

// Servicio de agricultores (solo administradores)
export const agricultorService = {
  getAll: async () => {
    const response = await api.get('/usuarios/');
    // Filtrar solo agricultores en el frontend
    const usuarios = response.data;
    return Array.isArray(usuarios) ? usuarios.filter((u: any) => u.rol?.toLowerCase() === 'agricultor') : usuarios;
  },
  create: async (data: any) => {
    // Usar el endpoint de registro que acepta cualquier usuario nuevo
    const response = await api.post('/registro/', {
      nombre: data.nombre,
      apellido: data.apellido || '',
      correo: data.correo,
      password: data.password || data.contraseña,
      telefono: data.telefono || '',
      rol: 'Agricultor'
    });
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch(`/usuarios/editar/${id}/`, {
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono
    });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/usuarios/eliminar/${id}/`);
    return response.data;
  },
};

// Servicio de perfil de usuario
export const perfilService = {
  update: async (data: any) => {
    const currentUser = authService.getUser();
    if (!currentUser?.correo) {
      return { error: 'No hay usuario logueado' };
    }
    
    const response = await api.patch('/usuarios/perfil/', {
      correo: currentUser.correo,
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      password: data.password || undefined
    });
    
    if (response.data.success && response.data.usuario) {
      userData.usuario = response.data.usuario;
    }
    return response.data;
  },
};

export const dashboardService = {
  getData: async () => {
    const response = await api.get('/dashboard/');
    return response.data.data || response.data;
  },
};

// Servicio de Fincas
export const fincaService = {
  getAll: async () => {
    const response = await api.get('/fincas/');
    return response.data;
  },
  getByUsuario: async (idUsuario: number) => {
    const response = await api.get(`/fincas/?id_usuario=${idUsuario}`);
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/fincas/${id}/`);
    return response.data;
  },
  create: async (data: any) => {
    // Obtener el ID del usuario actual
    const currentUser = authService.getUser();
    const usuarioId = currentUser?.id_usuario || currentUser?.id || data.id_usuario;
    
    // Transformar datos para el backend
    const fincaData = {
      nombre_finca: data.nombre_finca || data.nombre,
      ubicacion: data.ubicacion,
      tamaño_hectareas: data.tamaño_hectareas || data.area,
      descripcion: data.descripcion || '',
      id_usuario: usuarioId
    };
    const response = await api.post('/fincas/', fincaData);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const fincaData = {
      nombre_finca: data.nombre_finca || data.nombre,
      ubicacion: data.ubicacion,
      tamaño_hectareas: data.tamaño_hectareas || data.area,
      descripcion: data.descripcion
    };
    const response = await api.patch(`/fincas/${id}/`, fincaData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/fincas/${id}/`);
    return response.data;
  },
};

// Servicio de Historial de Riegos
export const riegoService = {
  getAll: async () => {
    const response = await api.get('/riegos/');
    return response.data;
  },
  getByCultivo: async (cultivoId: number) => {
    const response = await api.get(`/riegos/?id_cultivo=${cultivoId}`);
    return response.data;
  },
  create: async (data: any) => {
    const riegoData = {
      fecha_riego: data.fecha_riego,
      cantidad_agua: data.cantidad_agua,
      id_cultivo: data.id_cultivo
    };
    const response = await api.post('/riegos/', riegoData);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const riegoData = {
      fecha_riego: data.fecha_riego,
      cantidad_agua: data.cantidad_agua,
      id_cultivo: data.id_cultivo
    };
    const response = await api.patch(`/riegos/${id}/`, riegoData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/riegos/${id}/`);
    return response.data;
  },
};

// Servicio de Cultivos
export const cultivoService = {
  getAll: async () => {
    const response = await api.get('/cultivos/');
    return response.data;
  },
  getByFinca: async (fincaId: number) => {
    const response = await api.get(`/cultivos/?finca=${fincaId}`);
    return response.data;
  },
  create: async (data: any) => {
    // Transformar datos para el backend
    const cultivoData = {
      tipo_cultivo: data.tipo_cultivo || data.tipo,
      fecha_siembra: data.fecha_siembra,
      estado: data.estado,
      id_finca: data.id_finca
    };
    const response = await api.post('/cultivos/', cultivoData);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const cultivoData = {
      tipo_cultivo: data.tipo_cultivo || data.tipo,
      fecha_siembra: data.fecha_siembra,
      estado: data.estado,
      id_finca: data.id_finca
    };
    const response = await api.patch(`/cultivos/${id}/`, cultivoData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/cultivos/${id}/`);
    return response.data;
  },
};

// Servicio de Sensores
export const sensorService = {
  getAll: async () => {
    const response = await api.get('/sensores/');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/sensores/${id}/`);
    return response.data;
  },
  create: async (data: any) => {
    // Transformar datos para el backend
    const sensorData = {
      tipo_sensor: data.tipo_sensor || data.tipo,
      nombre: data.nombre || data.tipo_sensor,
      ubicacion: data.ubicacion,
      estado: data.estado || 'Activo',
      id_cultivo: data.id_cultivo || data.cultivo
    };
    const response = await api.post('/sensores/', sensorData);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const sensorData = {
      tipo_sensor: data.tipo_sensor || data.tipo,
      nombre: data.nombre,
      ubicacion: data.ubicacion,
      estado: data.estado
    };
    const response = await api.patch(`/sensores/${id}/`, sensorData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/sensores/${id}/`);
    return response.data;
  },
};

// Servicio de Mediciones
export const medicionService = {
  getAll: async () => {
    const response = await api.get('/mediciones/');
    return response.data;
  },
  getBySensor: async (sensorId: number) => {
    const response = await api.get(`/mediciones/?sensor=${sensorId}`);
    return response.data;
  },
  create: async (data: any) => {
    // Transformar datos para el backend
    const medicionData = {
      id_sensor: data.id_sensor || data.sensor,
      valor_humedad: data.valor_humedad || data.valor
    };
    const response = await api.post('/mediciones/crear/', medicionData);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/mediciones/${id}/`);
    return response.data;
  },
};

// Servicio de Alertas
export const alertaService = {
  getAll: async () => {
    const response = await api.get('/alertas/');
    return response.data;
  },
  getNoLeidas: async () => {
    const response = await api.get('/alertas/no-leidas/');
    return response.data;
  },
  create: async (data: any) => {
    // Transformar datos para el backend
    const alertaData = {
      tipo_alerta: data.tipo_alerta || data.tipo,
      descripcion: data.descripcion || data.mensaje,
      prioridad: data.prioridad
    };
    const response = await api.post('/alertas/crear/', alertaData);
    return response.data;
  },
  marcarLeida: async (id: number) => {
    const response = await api.patch(`/alertas/${id}/`, { leida: true });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/alertas/${id}/`);
    return response.data;
  },
};

export default api;

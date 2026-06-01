import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Rol {
    idRol: number;
    nombreRol: string;
}

export interface PermisoConfiguracion {
    idPermiso: number;
    modulo: string;
    descripcion: string;
    nombreSistema: string;
    tienePermiso: boolean;
}

export interface GuardarPermisosRequest {
    idRol: number;
    permisos: number[];
}

export const rolService = {
    obtenerRoles: async (): Promise<Rol[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/rol/roles`);
            return response.data.result;
        } catch (error) {
            console.error('Error al obtener roles:', error);
            throw new Error('Error al obtener roles');
        }
    },

    obtenerConfiguracion: async (idRol: number): Promise<PermisoConfiguracion[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/rol/configuracion/${idRol}`);
            return response.data.result;
        } catch (error) {
            console.error('Error al obtener configuración del rol:', error);
            throw new Error('Error al obtener configuración del rol');
        }
    },

    guardarConfiguracion: async (data: GuardarPermisosRequest): Promise<void> => {
        try {
            await axios.post(`${API_BASE_URL}/rol/configuracion`, data);
        } catch (error) {
            console.error('Error al guardar configuración del rol:', error);
            throw new Error('Error al guardar configuración del rol');
        }
    },

    validarPermiso: async (idUsuario: number, nombreSistema: string): Promise<boolean> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/rol/validar`, {
                idUsuario,
                nombreSistema
            });
            return response.data.tienePermiso;
        } catch (error) {
            console.error('Error al validar permiso:', error);
            return false;
        }
    }
};

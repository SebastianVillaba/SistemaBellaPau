import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Denominacion {
    idDenominacion: number;
    descripcion: string;
    valor: number;
    idMoneda: number;
    esBillete: boolean;
    activo: boolean;
}

export const denominacionService = {
    /**
     * Obtiene las denominaciones activas desde la API
     */
    getDenominacionesActivas: async (): Promise<Denominacion[]> => {
        try {
            const response = await axios.get(`${API_URL}/denominacion`);
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener denominaciones:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener denominaciones');
        }
    }
};

export default denominacionService;

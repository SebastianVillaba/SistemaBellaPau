import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const impuestoService = {
    consultaImpuesto: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/impuesto`);
            return response.data.result;
        } catch (error: any) {
            console.error('Error al consultar impuesto:', error);
            throw error;
        }
    }
}
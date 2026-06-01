import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Sector {
    idSector: number;
    nombreSector: string;
    activo: boolean;
}

export const sectorService = {
    consultaSectoresActivos: async (): Promise<Sector[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/sector`);
            return response.data.recordset;
        } catch (error: any) {
            console.error('Error al consultar sectores:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar sectores');
        }
    }
};

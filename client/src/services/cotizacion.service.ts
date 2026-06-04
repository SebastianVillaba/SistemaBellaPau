import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface Cotizacion {
  idMoneda: number;
  nombre: string;
  simbolo: string;
  cotizacion: number;
  activo: boolean;
}

export const cotizacionService = {
  getCotizaciones: async (): Promise<Cotizacion[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cotizaciones`);
      return response.data.result;
    } catch (error: any) {
      console.error('Error al consultar las cotizaciones:', error);
      throw error;
    }
  }
};

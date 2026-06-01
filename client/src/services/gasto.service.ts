import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface GastoData {
  idMovimientoCaja: number;
  idUsuario: number;
  concepto: string;
  montoGasto: number;
}

export const gastoService = {
  /**
   * Agrega un gasto a la caja
   */
  agregarGasto: async (gastoData: GastoData): Promise<any> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/caja/gasto`,
        gastoData
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al agregar gasto:', error);
      throw new Error(error.response?.data?.message || 'Error al agregar gasto');
    }
  }
};

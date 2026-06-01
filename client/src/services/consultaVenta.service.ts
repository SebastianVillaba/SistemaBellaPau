import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const consultaVentaService = {
  /**
   * Consulta ventas por número de factura
   */
  consultaVentaNroFactura: async (dsuc: number, dcaja: number, dfactu: number): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/consulta-venta/nro-factura`, {
        params: { dsuc, dcaja, dfactu }
      });
      return response.data.result;
    } catch (error: any) {
      console.error('Error al consultar venta por nro de factura:', error);
      throw new Error(error.response?.data?.message || 'Error al consultar venta');
    }
  },

  /**
   * Consulta ventas por rango de fechas
   */
  consultaVentaFecha: async (desde: string, hasta: string, imp: number = 1): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/consulta-venta/fecha`, {
        params: { desde, hasta, imp }
      });
      return response.data.result;
    } catch (error: any) {
      console.error('Error al consultar ventas por fecha:', error);
      throw new Error(error.response?.data?.message || 'Error al consultar ventas');
    }
  },

  /**
   * Consulta información detallada (cabecera y detalle)
   */
  consultaInformacionVenta: async (idVenta: number): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/consulta-venta/informacion`, {
        params: { idVenta }
      });
      return response.data; // { success, cabecera, detalle }
    } catch (error: any) {
      console.error('Error al consultar información de la venta:', error);
      throw new Error(error.response?.data?.message || 'Error al consultar información de venta');
    }
  }
};

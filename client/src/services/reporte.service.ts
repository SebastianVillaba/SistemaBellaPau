import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const reporteService = {
  /**
   * Obtiene los datos de una factura para imprimir
   */
  obtenerDatosFactura: async (idVenta: number): Promise<any> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reporte/factura`,
        {
          params: {
            idVenta
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener datos de factura:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener datos de factura');
    }
  },

  /**
   * Obtiene los datos de un ticket para imprimir
   */
  obtenerDatosTicket: async (idVenta: number): Promise<any> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reporte/ticket`,
        {
          params: {
            idVenta
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener datos de ticket:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener datos de ticket');
    }
  },

  obtenerDatosTicketPedido: async (idPedido: number, nro: number): Promise<any> => {
    try {
      console.log("Estos son idPediod y nro: ", idPedido, nro);
      const response = await axios.get(`${API_BASE_URL}/reporte/ticket-pedido`, {
        params: {
          idPedido,
          nro
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener ticket del pedido:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener ticket del pedido');
    }
  },

  obtenerDatosCierreCaja: async (idMovimientoCaja: number): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reporte/cierre-caja`, {
        params: {
          idMovimientoCaja
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener datos de cierre de caja:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener datos de cierre de caja');
    }
  },

  obtenerTicketRemision: async (idRemision: number): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reporte/ticket-remision`, {
        params: {
          idRemision
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener ticket de remisión:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener ticket de remisión');
    }
  }
};

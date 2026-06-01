import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface AgregarDetalleVentaRequest {
  idTerminalWeb: number;
  idUsuario: number;
  idProducto: number;
  idStock: number;
  cantidad: number;
  precioUnitario: number;
  precioDescuento?: number;
}

export interface DetalleVentaTmp {
  idDetVentaTmp: number;
  idProducto: number;
  codigo: string;
  nombreMercaderia: string;
  origen: string;
  cantidad: number;
  precioUnitario: number;
  precioDescuento: number;
  total: number;
  stock: number;
  nombreImpuesto: string;
  iva10: number;
  iva5: number;
  gravada10: number;
  gravada5: number;
  exenta: number;
}

export const ventaService = {
  /**
   * Agrega un producto al detalle de venta temporal
   */
  agregarDetalleVenta: async (data: AgregarDetalleVentaRequest): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/venta/detalletmp`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error al agregar detalle de venta:', error);
      throw new Error(error.response?.data?.message || 'Error al agregar producto');
    }
  },

  /**
   * Consulta los productos del detalle de venta temporal
   */
  consultarDetalleVenta: async (idTerminalWeb: number, idUsuario: number): Promise<DetalleVentaTmp[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/venta/detalletmp`, {
        params: {
          idTerminalWeb,
          idUsuario
        }
      });
      return response.data.result;
    } catch (error: any) {
      console.error('Error al consultar detalle de venta:', error);
      throw new Error(error.response?.data?.message || 'Error al consultar detalle de venta');
    }
  },

  /**
   * Elimina un producto del detalle de venta temporal
   */
  eliminarDetalleVenta: async (idTerminalWeb: number, idDetVentaTmp: number): Promise<any> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/venta/detalletmp`, {
        params: {
          idTerminalWeb,
          idDetVentaTmp
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al eliminar detalle de venta:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar producto');
    }
  },

  /**
   * Guarda/finaliza una venta
   */
  guardarVenta: async (data: any): Promise<any> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/venta/guardar`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error al guardar venta:', error);
      throw error;
    }
  },

  /**
   * Consulta la factura actual
   */
  consultaFacturaCorrelativa: async (idTerminalWeb: number): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/venta/facturaActual`, {
        params: {
          idTerminalWeb
        }
      });
      return response.data.result;
    } catch (error: any) {
      console.error('Error al consultar factura actual:', error);
      throw new Error(error.response?.data?.message || 'Error al consultar factura actual');
    }
  }
};
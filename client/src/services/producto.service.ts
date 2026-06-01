import axios from 'axios';
import type { Producto, TipoProducto } from '../types/producto.types';

// URL base del API - ajusta según tu configuración
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Interface para la respuesta del endpoint producto/info
 */
interface ProductoInfoResponse {
  succes: boolean;
  message: string;
  result: ProductoInfo[];
}

/**
 * Interface para la respuesta del API al insertar un producto
 */
interface InsertarProductoResponse {
  success: boolean;
  message: string;
  rowsAffected?: number;
}

/**
 * Interface para los datos de producto desde producto/info
 */
interface ProductoInfo {
  idProducto: number;
  nombre: string;
  presentacion: string;
  codigo: string;
  codigoBarra: string;
  precio: number;
  costo: number;
  idTipoProducto: number;
  gasto: boolean;
  idImpuesto: number;
}

/**
 * Servicio para manejar las operaciones relacionadas con Productos
 */
export const productoService = {
  /**
   * Inserta un nuevo producto en el sistema
   * @param producto - Datos del producto a insertar
   * @returns Respuesta del servidor
   */
  insertarProducto: async (producto: Producto): Promise<InsertarProductoResponse> => {
    try {
      const response = await axios.post<InsertarProductoResponse>(
        `${API_BASE_URL}/producto`,
        producto
      );
      return response.data;
    } catch (error: any) {
      // Manejar errores del servidor
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Error al insertar el producto');
      }
      throw new Error('Error de conexión con el servidor');
    }
  },

  /**
   * Modifica un producto existente
   * @param producto - Datos del producto a modificar
   * @returns Respuesta del servidor
   */
  modificarProducto: async (producto: any): Promise<InsertarProductoResponse> => {
    try {
      const response = await axios.put<InsertarProductoResponse>(
        `${API_BASE_URL}/producto`,
        producto
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Error al modificar el producto');
      }
      throw new Error('Error de conexión con el servidor');
    }
  },

  /**
   * Busca productos por término de búsqueda
   * @param searchTerm - Término a buscar
   * @param searchBy - Campo por el cual buscar
   * @returns Lista de productos encontrados
   */
  buscarProductos: async (
    searchTerm: string,
    searchBy: number
  ): Promise<Producto[]> => {
    try {
      // TODO: Implementar endpoint de búsqueda en el backend
      const response = await axios.get<Producto[]>(
        `${API_BASE_URL}/producto/consulta`,
        {
          params: {
            "tipoBusqueda": searchBy,
            "busqueda": searchTerm
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al buscar productos:', error);
      throw new Error('Error al buscar productos');
    }
  },

  /**
   * Obtiene información detallada de un producto por su ID
   * @param idProducto - ID del producto
   * @returns Información completa del producto
   */
  obtenerInfoProducto: async (idProducto: number): Promise<ProductoInfo[]> => {
    try {
      const response = await axios.get<ProductoInfoResponse>(
        `${API_BASE_URL}/producto/info`,
        {
          params: {
            idProducto: idProducto
          }
        }
      );
      return response.data.result;
    } catch (error: any) {
      console.error('Error al obtener información del producto:', error);
      throw new Error('Error al obtener información del producto');
    }
  },

  /**
   * Obtiene la lista de tipos de producto
   * @returns Lista de tipos de producto
   */
  obtenerTiposProducto: async (): Promise<TipoProducto[]> => {
    try {
      const response = await axios.get<TipoProducto[]>(
        `${API_BASE_URL}/producto/tipoProducto`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener tipos de producto:', error);
      throw new Error('Error al obtener tipos de producto');
    }
  },

  /**
   * Consulta precio de producto por código, código de barra o nombre
   * @param busqueda - Término de búsqueda (código, código de barra o nombre)
   * @returns Lista de productos encontrados con precio y stock
   */
  consultarPrecioProducto: async (busqueda: string, idTerminalWeb: number): Promise<any[]> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/producto/precio`,
        {
          params: {
            busqueda: busqueda,
            idTerminalWeb: idTerminalWeb
          }
        }
      );
      return response.data.result;
    } catch (error: any) {
      console.error('Error al consultar precio del producto:', error);
      throw new Error('Error al consultar precio del producto');
    }
  }
};

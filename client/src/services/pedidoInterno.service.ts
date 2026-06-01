import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface IAgregarDetallePedidoInternoRequest {
    idTerminalWeb: number;
    idProducto: number;
    cantidadSolicitada: number;
}

export interface IGuardarPedidoInternoRequest {
    idUsuario: number;
    idTerminalWeb: number;
    idSucursalProveedor: number;
    fechaNecesaria: string;
    observacion: string;
}

export const pedidoInternoService = {
    agregarDetalle: async (data: IAgregarDetallePedidoInternoRequest) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/pedido-interno/detalle`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error al agregar detalle pedido interno:', error);
            throw new Error(error.response?.data?.message || 'Error al agregar detalle');
        }
    },

    eliminarDetalle: async (idTerminalWeb: number, idDetPedidoInternoTmp: number) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/pedido-interno/detalle`, {
                data: { idTerminalWeb, idDetPedidoInternoTmp }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al eliminar detalle pedido interno:', error);
            throw new Error(error.response?.data?.message || 'Error al eliminar detalle');
        }
    },

    guardarPedido: async (data: IGuardarPedidoInternoRequest) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/pedido-interno`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error al guardar pedido interno:', error);
            throw error;
        }
    },

    consultarDetalleTmp: async (idTerminalWeb: number) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pedido-interno/detalle`, {
                params: { idTerminalWeb }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar detalle temporal:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar detalle temporal');
        }
    },

    consultarPedidosRecibidos: async (idTerminalWeb: number) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pedido-interno/recibidos`, {
                params: { idTerminalWeb }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar pedidos recibidos:', error);
            throw error;
        }
    },

    consultarDetalleEntrante: async (idPedidoInterno: number) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pedido-interno/recibidos/detalle`, {
                params: { idPedidoInterno }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar detalle entrante:', error);
            throw error;
        }
    },

    consultaSucursales: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pedido-interno/sucursales`);
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar sucursales:', error);
            throw error;
        }
    }
};

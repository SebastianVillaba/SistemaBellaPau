import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface IAgregarDetalleRemisionRequest {
    idTerminalWeb: number;
    idProducto: number;
    idStock: number;
    cantidadEnviada: number;
}

export interface IGuardarRemisionRequest {
    idUsuario: number;
    idTerminalWeb: number;
    idDepositoDestino: number;
    idPedidoInterno: number | null;
    observacion: string;
}

export interface IRecibirRemisionRequest {
    idRemision: number;
    idUsuarioReceptor: number;
}

export const remisionService = {
    consultarStock: async (busqueda: string, idTerminalWeb: number) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/remisiones/stock`, {
                params: { busqueda, idTerminalWeb }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar stock:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar stock');
        }
    },

    /**
     * 
     *  ZONA PARA REMISIONES
     * 
     */

    consultarDetalleRemisionTmp: async (idTerminalWeb: Number) => {
        try {
            const result = await axios.get(`${API_BASE_URL}/remisiones/detalle`, {
                params: { idTerminalWeb }
            });
            console.log(result);

            return result.data;
        } catch (error: any) {
            console.error('Error al consultar detalle remisión temporal:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar detalle remisión temporal');
        }
    },

    agregarDetalleRemision: async (data: IAgregarDetalleRemisionRequest) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/remisiones/detalle`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error al agregar detalle remisión:', error);
            throw new Error(error.response?.data?.message || 'Error al agregar detalle');
        }
    },

    guardarRemision: async (data: IGuardarRemisionRequest) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/remisiones`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error al guardar remisión:', error);
            throw error;
        }
    },

    eliminarDetalleRemisionTmp: async (idTerminalWeb: number, idDetRemisionTmp: number) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/remisiones/detalle`, {
                params: { idTerminalWeb, idDetRemisionTmp }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al eliminar detalle remisión temporal:', error);
            throw new Error(error.response?.data?.message || 'Error al eliminar detalle remisión temporal');
        }
    },


    /**
     * 
     *  ZONA PARA RECIBIR REMISIONES
     * 
     */
    consultaRemisionesEntrantes: async (idTerminalWeb: number) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/remisiones/remisionesEntrantes`, {
                params: { idTerminalWeb }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar remisiones entrantes:', error);
            throw error;
        }
    },
    consultaDetRemisionEntrante: async (idRemision: number) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/remisiones/detalleRemisionEntrante`, {
                params: { idRemision }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar detalle remisión entrante:', error);
            throw error;
        }
    },
    recibirRemision: async (data: IRecibirRemisionRequest) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/remisiones/recibir`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error al recibir remisión:', error);
            throw error;
        }
    },

    consultaDeposito: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/remisiones/depositos`);
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar depositos:', error);
            throw error;
        }
    },

    importarPedido: async (idTerminalWeb: number, idPedidoInterno: number) => {
        try {
            console.log(idTerminalWeb, idPedidoInterno);

            const response = await axios.post(`${API_BASE_URL}/remisiones/importar-pedido`, {
                idTerminalWeb,
                idPedidoInterno
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al importar pedido interno:', error);
            throw new Error(error.response?.data?.message || 'Error al importar pedido interno');
        }
    }


};

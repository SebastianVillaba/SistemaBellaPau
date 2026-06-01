import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const API_URL = `${API_BASE_URL}/stock-inicial`;

export interface IDetalleStockInicial {
    idDetStockInicialTmp: number;
    nro: number;
    idProducto: number;
    codigo: string;
    nombreProducto: string;
    cantidad: number;
    costo: number;
    totalValorizado: number;
}

export const stockInicialService = {
    agregarDetalle: async (data: { idTerminalWeb: number, idProducto: number, cantidad: number, costo: number }) => {
        const response = await axios.post(`${API_URL}/detalle`, data);
        return response.data;
    },

    eliminarDetalle: async (idTerminalWeb: number, idDetStockInicialTmp: number) => {
        const response = await axios.delete(`${API_URL}/detalle/${idTerminalWeb}/${idDetStockInicialTmp}`);
        return response.data;
    },

    consultarDetalle: async (idTerminalWeb: number): Promise<IDetalleStockInicial[]> => {
        const response = await axios.get(`${API_URL}/detalle/${idTerminalWeb}`);
        return response.data;
    },

    guardarStockInicial: async (data: { idUsuario: number, idTerminalWeb: number, idDeposito: number }) => {
        const response = await axios.post(`${API_URL}/guardar`, data);
        return response.data;
    }
};

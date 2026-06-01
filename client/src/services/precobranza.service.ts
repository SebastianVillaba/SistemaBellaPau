import axios from 'axios';

const API_URL = 'http://localhost:4000/api/precobranza'; // Adjust base URL as needed

export interface DetallePrecobranzaTmp {
    nro: number;
    idDetPrecobranzaTmp: number;
    idPedido: number;
    nombreCliente: string;
    direccion: string;
    nombreDelivery: string;
    nombreTipo: string;
}

export interface CobranzaPendiente {
    idPedido: number;
    nombreCliente: string;
    nombreEstado: string;
    fechaPedido: string;
}

export const precobranzaService = {
    getCobranzasPendientes: async (idCliente: number) => {
        const response = await axios.get(`${API_URL}/pendientes`, { params: { idCliente } });
        return response.data;
    },

    agregarDetPrecobranzaTmp: async (idTerminalWeb: number, idPedido: number) => {
        const response = await axios.post(`${API_URL}/detalle/tmp`, { idTerminalWeb, idPedido });
        return response.data;
    },

    consultarDetPrecobranzaTmp: async (idTerminalWeb: number) => {
        const response = await axios.get(`${API_URL}/detalle/tmp`, { params: { idTerminalWeb } });
        return response.data;
    },

    eliminarDetPrecobranzaTmp: async (idTerminalWeb: number, idDetPrecobranzaTmp: number) => {
        const response = await axios.delete(`${API_URL}/detalle/tmp`, { params: { idTerminalWeb, idDetPrecobranzaTmp } });
        return response.data;
    },

    guardarPrecobranza: async (data: { idUsuarioAlta: number; idTerminalWeb: number; idDelivery: number; idCliente: number }) => {
        const response = await axios.post(`${API_URL}/`, data);
        return response.data;
    },
};

import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/compras`;

export interface DetalleCompraTmp {
    idDetCompraTmp: number;
    idProducto: number;
    codigo: string;
    mercaderia: string;
    cantidad: number;
    costo: number; // This might be unit cost or total cost depending on backend, checking controller... controller uses costoTotal and precio. Let's align with controller.
    bonificacion: number;
    lote: string;
    vencimiento: string;
    exenta: number;
    gravada5: number;
    gravada10: number;
    totalCosto: number;
    precio: number;
    porcentajeIva: number;
}

export const comprasService = {
    buscarProducto: async (query: string) => {
        const response = await axios.get(`${API_URL}/productos`, { params: { busqueda: query } });
        return response.data;
    },

    agregarDetalleCompra: async (detalle: any) => {
        const response = await axios.post(`${API_URL}/detalle/tmp`, detalle);
        return response.data;
    },

    consultarDetalleTemporal: async (idTerminalWeb: number) => {
        const response = await axios.get(`${API_URL}/detalle/tmp`, { params: { idTerminalWeb } });
        return response.data;
    },

    eliminarItemTemporal: async (idTerminalWeb: number, idDetCompraTmp: number) => {
        const response = await axios.delete(`${API_URL}/detalle/tmp`, { params: { idTerminalWeb, idDetCompraTmp } });
        return response.data;
    },

    limpiarTemporal: async (idTerminalWeb: number) => {
        const response = await axios.delete(`${API_URL}/detalle/tmp/all`, { params: { idTerminalWeb } });
        return response.data;
    },

    guardarCompra: async (compra: any) => {
        const response = await axios.post(`${API_URL}`, compra);
        return response.data;
    },

    buscarProveedores: async () => {
        const response = await axios.get(`${API_URL}/proveedor`);
        return response.data;
    }
};

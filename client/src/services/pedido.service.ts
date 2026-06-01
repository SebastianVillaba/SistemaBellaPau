import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

//#region Interfaces
export interface AgregarDetallePedidoRequest {
    idTerminalWeb: number;
    idProducto: number;
    idStock: number;
    cantidad: number;
    precio: number;
}

export interface GuardarPedidoRequest {
    idUsuarioAlta: number;
    idTerminalWeb: number;
    idPedidoExistente: number;
    idTipoCobro: number;
    idCliente: number;
    idDelivery: number;
    direccion: string;
    fechaEntrega: string;
    observacion: string;
}

export interface ItemPedidoDia {
    codigo: number | string;
    nombre: string;
    cantidad: number;
}
export interface DetallePedido {
    idDetPedidoTmp: number;
    idProducto: number;
    codigo: string;
    nombreMercaderia: string;
    origen: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    stock: number;
    nombreImpuesto: string;
    nro: number;
}

export interface TipoCobro {
    idTipoCobro: number;
    nombreTipo: string;
}

export interface DatosPedido {
    idPedido: number;
    idCliente: number;
    nombreCliente: string;
    ruc: string;
    dv: string;
    celular: string;
    idDelivery: number;
    idTipoCobro: number;
    direccion: string;
    totalPedido: number;
    fechaEntrega: string;
    observacion: string | null;
    activo: boolean;
}
export interface PedidoFiltrado {
    fechaEntrega: string;
    Nro: number;
    nombreCliente: string;
    estado: string;
    tipoCobro: string;
    totalPedido: number;
    nombreDelivery: string;
    idPedido?: number;
}
//#region Interfaces

export const pedidoService = {
    agregarDetallePedido: async (data: AgregarDetallePedidoRequest): Promise<any> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/pedido/detalle`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error al agregar detalle de pedido:', error);
            throw new Error(error.response?.data?.message || 'Error al agregar producto al pedido');
        }
    },

    consultarDetallePedido: async (idTerminalWeb: number): Promise<DetallePedido[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pedido/detalle`, {
                params: {
                    idTerminalWeb
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar el detalle del pedido:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar el detalle del pedido');
        }
    },

    eliminarDetallePedido: async (idTerminalWeb: number, idDetPedidoTmp: number): Promise<any> => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/pedido/detalle`, {
                params: {
                    idTerminalWeb,
                    idDetPedidoTmp
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al eliminar detalle de pedido:', error);
            throw new Error(error.response?.data?.message || 'Error al eliminar producto del pedido');
        }
    },

    guardarPedido: async (data: GuardarPedidoRequest): Promise<any> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/pedido`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error al guardar el pedido:', error);
            throw new Error(error.response?.data?.message || 'Error al guardar el pedido');
        }
    },

    consultarPedidosDia: async (): Promise<ItemPedidoDia[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pedido/dia`);
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar los pedidos del día:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar los pedidos del día');
        }
    },

    consultaTipoCobro: async (): Promise<TipoCobro[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pedido/tipoCobro`);
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar los tipos de cobro:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar los tipos de cobro');
        }
    },

    obtenerDatosPedido: async (idPedido: number, idTerminalWeb: number): Promise<DatosPedido> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pedido/${idPedido}`, {
                params: { idTerminalWeb }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al obtener datos del pedido:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener datos del pedido');
        }
    },

    limpiarDetPedidoTmp: async (idTerminalWeb: number): Promise<any> => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/pedido/detalleTmp`, {
                params: { idTerminalWeb }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al limpiar detalles del pedido:', error);
            throw new Error(error.response?.data?.message || 'Error al limpiar detalles del pedido');
        }
    },

    anularPedido: async (idPedido: number): Promise<any> => {
        try {
            const response = await axios.put(`${API_BASE_URL}/pedido/anular/${idPedido}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al anular el pedido:', error);
            throw new Error(error.response?.data?.message || 'Error al anular el pedido');
        }
    },

    // ── Facturación de pedidos ────────────────────────────────────────────────

    /** Mueve UN pedido a la tabla de detVentaTmp y lo marca como no pendiente */
    pedidoClienteFacturacion: async (idPedido: number, idTerminalWeb: number): Promise<any> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/pedido/facturacion/pedido`, { idPedido, idTerminalWeb });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al facturar el pedido');
        }
    },

    /** Mueve TODOS los pedidos pendientes de un cliente a detVentaTmp */
    facturarPedidosPendientesCliente: async (idCliente: number, idTerminalWeb: number): Promise<any> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/pedido/facturacion/cliente-pendientes`, { idCliente, idTerminalWeb });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al facturar pedidos del cliente');
        }
    },

    /** Procesa la facturación masiva de los pedidos marcados en detPedidoFacturacionTmp */
    pedidosClienteMasivoAFacturacion: async (idTerminalWeb: number): Promise<any> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/pedido/facturacion/masivo`, { idTerminalWeb });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error en facturación masiva');
        }
    },

    /** Agrega un pedido a la selección temporal para facturación masiva */
    agregarDetPedidoFacturacionTmp: async (idTerminalWeb: number, idPedido: number): Promise<any> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/pedido/facturacion/tmp`, { idTerminalWeb, idPedido });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al agregar pedido a selección');
        }
    },

    /** Quita un pedido de la selección temporal para facturación masiva */
    eliminarDetPedidoFacturacionTmp: async (idTerminalWeb: number, idDetPedidoFacturacionTmp: number): Promise<any> => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/pedido/facturacion/tmp`, {
                params: { idTerminalWeb, idDetPedidoFacturacionTmp }
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al quitar pedido de selección');
        }
    },

    /** Consulta pedidos filtrados por fecha de entrega */
    consultarPedidosPorFecha: async (fecha: string): Promise<PedidoFiltrado[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pedido/buscar/fecha`, {
                params: { fecha }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar pedidos por fecha:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar pedidos por fecha');
        }
    },

    /** Consulta pedidos con filtros: nombre, tipo cobro, estado */
    consultarPedidosFiltro: async (
        nombre: string,
        idTipoCobro: number,
        habilitarEstado: boolean,
        estadoCobro: boolean | null
    ): Promise<PedidoFiltrado[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/pedido/buscar/filtro`, {
                params: {
                    nombre,
                    idTipoCobro,
                    habilitarEstado: habilitarEstado ? 'true' : 'false',
                    estadoCobro: estadoCobro === null ? '' : (estadoCobro ? 'true' : 'false')
                }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al consultar pedidos con filtro:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar pedidos con filtro');
        }
    },
};

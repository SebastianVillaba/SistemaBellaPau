import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface IAgregarDetAjusteStockTmpRequest {
    idTerminalWeb: number;
    idStock: number;
    cantidad: number;
    esNegativo: boolean;
}

export interface IGuardarAjusteStockRequest {
    idUsuario: number;
    idTerminalWeb: number;
    idDeposito: number;
    idTipoAjuste: number;
    motivo: string;
}

export const ajustesService = {
    agregarDetAjusteStockTmp: async (data: IAgregarDetAjusteStockTmpRequest) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/ajustes/agregarDetAjusteStockTmp`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error al agregar detalle ajuste stock:', error);
            throw new Error(error.response?.data?.message || 'Error al agregar detalle');
        }
    },

    eliminarDetAjusteStockTmp: async (idTerminalWeb: number, idDetAjusteStockTmp: number) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/ajustes/eliminarDetAjusteStockTmp`, {
                idTerminalWeb,
                idDetAjusteStockTmp
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al eliminar detalle ajuste stock:', error);
            throw new Error(error.response?.data?.message || 'Error al eliminar detalle');
        }
    },

    consultaDetAjusteStockTmp: async (idTerminalWeb: number, idTipoAjuste: number) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/ajustes/consultaDetAjusteStockTmp`,{
                    params: {
                        idTerminalWeb,
                        idTipoAjuste
                    }
                }
            );
            return response.data.result.recordset;
        } catch (error: any) {
            console.error('Error al consultar detalle ajuste stock:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar detalle');
        }
    },

    guardarAjusteStock: async (data: IGuardarAjusteStockRequest) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/ajustes/guardarAjusteStock`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error al guardar ajuste stock:', error);
            throw new Error(error.response?.data?.message || 'Error al guardar ajuste');
        }
    },

    consultaTipoAjuste: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/ajustes/consultaTipoAjuste`);
            return response.data.result.recordset;
        } catch (error: any) {
            console.error('Error al consultar tipo ajuste:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar tipo ajuste');
        }
    }
};

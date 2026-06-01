import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ArqueoCajaTmpItem {
    idArqueoTmp: number;
    idDenominacion: number;
    nombreBillete: string;
    valor: number;
    cantidad: number;
    subtotal: number;
}

export interface ListarArqueoResponse {
    success: boolean;
    result: ArqueoCajaTmpItem[];
    totalArqueo?: number;
}

export interface GastoCajaTmpItem {
    idGastoCajaTmp: number;
    concepto: string;
    montoGasto: number;
}

export interface ListarGastoCajaTmpResponse {
    success: boolean;
    result: GastoCajaTmpItem[];
    totalGastos?: number;
}

/**
 * Denominaciones de billetes en Guaraníes
 * Los IDs corresponden a la base de datos
 */
export const DENOMINACIONES = [
    { id: 1, nombre: 'Billete 100.000', valor: 100000 },
    { id: 2, nombre: 'Billete 50.000', valor: 50000 },
    { id: 3, nombre: 'Billete 20.000', valor: 20000 },
    { id: 4, nombre: 'Billete 10.000', valor: 10000 },
    { id: 5, nombre: 'Billete 5.000', valor: 5000 },
    { id: 6, nombre: 'Billete 2.000', valor: 2000 },
];

export const cajaService = {
    /**
     * Agrega una denominación al arqueo temporal
     */
    agregarArqueoCajaTmp: async (
        idTerminalWeb: number,
        idDenominacion: number,
        cantidad: number
    ): Promise<{ success: boolean; message: string }> => {
        const response = await axios.post(`${API_URL}/caja/agregarArqueoCajaTmp`, {
            idTerminalWeb,
            idDenominacion,
            cantidad,
        });
        return response.data;
    },

    /**
     * Lista los items del arqueo temporal y el total
     */
    listarArqueoCajaTmp: async (idTerminalWeb: number): Promise<ListarArqueoResponse> => {
        const response = await axios.get(`${API_URL}/caja/listarArqueoCajaTmp`, {
            params: { idTerminalWeb },
        });

        // El SP devuelve dos recordsets: items y totalArqueo
        const data = response.data;

        // Si el backend devuelve el totalArqueo separado, lo extraemos
        let totalArqueo = 0;
        if (data.result && data.result.length > 0) {
            // Calcular el total sumando los subtotales
            totalArqueo = data.result.reduce((sum: number, item: ArqueoCajaTmpItem) =>
                sum + (item.subtotal || 0), 0
            );
        }

        return {
            success: data.success,
            result: data.result || [],
            totalArqueo,
        };
    },

    /**
     * Abre una caja con el monto del arqueo
     */
    abrirCaja: async (
        idUsuario: number,
        idTerminalWeb: number
    ): Promise<{ success: boolean; idMovimientoCaja?: number; message?: string }> => {
        const response = await axios.post(`${API_URL}/caja/abrir`, {
            idUsuario,
            idTerminalWeb
        });
        return response.data;
    },

    /**
     * Cierra una caja con el monto del arqueo
     */
    cerrarCaja: async (
        idUsuarioCierre: number,
        idTerminalWeb: number
    ): Promise<{ success: boolean; message?: string; idMovimientoCaja?: number }> => {
        const response = await axios.post(`${API_URL}/caja/cerrar`, {
            idUsuarioCierre,
            idTerminalWeb,
        });
        return response.data;
    },

    /**
     * Elimina una denominación del arqueo temporal
     */
    eliminarArqueoCajaTmp: async (
        idTerminalWeb: number,
        idArqueoTmp: number
    ): Promise<{ success: boolean; message?: string }> => {
        const response = await axios.delete(`${API_URL}/caja/eliminarArqueoCajaTmp`, {
            params: { idTerminalWeb, idArqueoTmp }
        });
        return response.data;
    },

    /**
     * Agrega un gasto a la caja
     */
    agregarGastoCaja: async (
        idTerminalWeb: number,
        idMovimientoCaja: number,
        concepto: string,
        montoGasto: number,
        idGastoCajaTmp: number | null = null
    ): Promise<{ success: boolean; message?: string }> => {
        const response = await axios.post(`${API_URL}/caja/gasto`, {
            idGastoCajaTmp,
            idTerminalWeb,
            idMovimientoCaja,
            concepto,
            montoGasto
        });
        return response.data;
    },

    /**
     * Lista los gastos temporales de la caja
     */
    listarGastoCajaTmp: async (
        idTerminalWeb: number
    ): Promise<ListarGastoCajaTmpResponse> => {
        const response: ListarGastoCajaTmpResponse = await axios.get(`${API_URL}/caja/gasto`, {
            params: { idTerminalWeb },
        });

        console.log(response.data);


        return response.data;
    },

    /**
     * Elimina un gasto temporal de la caja
     */
    eliminarGastoCajaTmp: async (
        idGastoCajaTmp: number,
        idTerminalWeb: number
    ): Promise<{ success: boolean; message?: string }> => {
        const response = await axios.delete(`${API_URL}/caja/eliminarGastoCajaTmp`, {
            params: { idGastoCajaTmp, idTerminalWeb }
        });
        return response.data;
    },
};

export default cajaService;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface IAgregarDetPlanillaPacienteRequest {
    idTerminalWeb: number;
    nombreApellido: string;
    ci: string;
    sala: number;
    desayuno: boolean;
    almuerzo: boolean;
    merienda: boolean;
    cena: boolean;
}

export interface IGuardarPlanillaPacienteRequest {
    idUsuarioAlta: number;
    idTerminalWeb: number;
    fechaPlanilla: string; // YYYY-MM-DD
    idTipoPlanillaPac: number;
}

export interface IGuardarPlanillaFuncionarioRequest {
    idUsuario: number;
    idTerminalWeb: number;
    fechaPlanilla: string;
    idTipoPlanilla: number;
}

export interface IAgregarDetPlanillaFuncionarioRequest {
    idTerminalWeb: number;
    idFuncionario: number;
}

export const planillasService = {
    agregarDetPlanillaPacienteTmp: async (data: IAgregarDetPlanillaPacienteRequest) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/planillas/agregarDetPlanillaPacienteTmp`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error al agregar detalle planilla paciente:', error);
            throw new Error(error.response?.data?.message || 'Error al agregar detalle');
        }
    },

    consultaDetPlanillaPacienteTmp: async (idTerminalWeb: number) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/planillas/consultaDetPlanillaPacienteTmp/${idTerminalWeb}`);
            return response.data.result.recordset;
        } catch (error: any) {
            console.error('Error al consultar detalle planilla paciente:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar detalle');
        }
    },

    eliminarDetPlanillaPacienteTmp: async (idTerminalWeb: number, idDetPlanillaPacTmp: number) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/planillas/eliminarDetPlanillaPacienteTmp`, {
                data: { idTerminalWeb, idDetPlanillaPacTmp }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al eliminar detalle planilla paciente:', error);
            throw new Error(error.response?.data?.message || 'Error al eliminar detalle');
        }
    },

    guardarPlanillaPaciente: async (data: IGuardarPlanillaPacienteRequest) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/planillas/guardarPlanillaPaciente`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error al guardar planilla paciente:', error);
            throw new Error(error.response?.data?.message || 'Error al guardar planilla');
        }
    },

    obtenerTipoPlanillasPac: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/planillas/obtenerTipoPlanillaPac`);
            return response.data.result.recordset;
        } catch (error: any) {
            console.error('Error al obtener tipo planilla paciente:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener tipo planilla');
        }
    },

    // FUNCIONARIOS
    agregarDetPlanillaFunTmp: async (idTerminalWeb: number, idFuncionario: number) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/planillas/agregarDetPlanillaFunTmp`, {
                idTerminalWeb,
                idFuncionario
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al agregar detalle planilla funcionario:', error);
            throw new Error(error.response?.data?.message || 'Error al agregar detalle');
        }
    },

    consultaDetPlanillaFunTmp: async (idTerminalWeb: number) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/planillas/consultaDetPlanillaFunTmp/${idTerminalWeb}`);
            return response.data.result.recordset;
        } catch (error: any) {
            console.error('Error al consultar detalle planilla funcionario:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar detalle');
        }
    },

    eliminarDetPlanillaFunTmp: async (idTerminalWeb: number, idDetPlanillaFunTmp: number) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/planillas/eliminarDetPlanillaFunTmp`, {
                data: { idTerminalWeb, idDetPlanillaFunTmp }
            });
            return response.data;
        } catch (error: any) {
            console.error('Error al eliminar detalle planilla funcionario:', error);
            throw new Error(error.response?.data?.message || 'Error al eliminar detalle');
        }
    },

    guardarPlanillaFuncionario: async (data: IGuardarPlanillaFuncionarioRequest) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/planillas/guardarPlanillaFuncionario`, data);
            return response.data;
        } catch (error: any) {
            console.error('Error al guardar planilla funcionario:', error);
            throw new Error(error.response?.data?.message || 'Error al guardar planilla');
        }
    },

    obtenerTipoPlanillaFun: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/planillas/obtenerTipoPlanillaFun`);
            return response.data.result.recordset;
        } catch (error: any) {
            console.error('Error al obtener tipo planilla funcionario:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener tipo planilla');
        }
    },

    consultaFuncionariosActivos: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/planillas/consultaFuncionariosActivos`);
            return response.data.result.recordset;
        } catch (error: any) {
            console.error('Error al consultar funcionarios activos:', error);
            throw new Error(error.response?.data?.message || 'Error al consultar funcionarios');
        }
    }
};

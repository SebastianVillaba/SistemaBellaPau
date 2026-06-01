import axios from 'axios';
import type { TerminalWeb, TerminalWebSearchResult } from '../types/terminalWeb.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const terminalWebService = {
    buscarTerminales: async (busqueda: string): Promise<TerminalWebSearchResult[]> => {
        const response = await axios.get(`${API_BASE_URL}/terminal-web/buscar`, {
            params: { busqueda }
        });
        return response.data;
    },

    obtenerTerminal: async (idTerminalWeb: number): Promise<TerminalWeb> => {
        const response = await axios.get(`${API_BASE_URL}/terminal-web/${idTerminalWeb}`);
        return response.data;
    },

    crearTerminal: async (terminal: TerminalWeb): Promise<{ success: boolean; message: string }> => {
        const response = await axios.post(`${API_BASE_URL}/terminal-web`, terminal);
        return response.data;
    },

    modificarTerminal: async (terminal: TerminalWeb): Promise<{ success: boolean; message: string }> => {
        const response = await axios.put(`${API_BASE_URL}/terminal-web`, terminal);
        return response.data;
    }
};

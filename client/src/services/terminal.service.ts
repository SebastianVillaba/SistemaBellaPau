import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TERMINAL_TOKEN_KEY = 'terminalToken';

/**
 * Genera un UUID v4 compatible con contextos no seguros (HTTP).
 */
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Obtiene el token de la terminal desde localStorage o genera uno nuevo.
 * @returns El token de la terminal.
 */
export const obtenerOgenerarToken = (): string => {
  let token = localStorage.getItem(TERMINAL_TOKEN_KEY);
  if (!token) {
    token = generateUUID();
    localStorage.setItem(TERMINAL_TOKEN_KEY, token);
  }
  return token;
};

/**
 * Valida el token de la terminal con el backend.
 * @param token - El token de la terminal a validar.
 * @returns La respuesta del servidor.
 */
export const validarTerminal = async (token: string) => {
  const response = await axios.post(`${API_BASE_URL}/terminal/validar`, { terminalToken: token });
  return response.data;
};


export const obtenerTerminalInfo = async (idTerminalWeb: number) => {
  const response = await axios.get(`${API_BASE_URL}/terminal/info`, {
    params: {
      idTerminalWeb: idTerminalWeb
    }
  });
  return response.data;
};

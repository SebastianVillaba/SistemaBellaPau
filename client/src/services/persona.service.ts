import axios from 'axios';
import type { Persona } from '../types/persona.types';

// URL base del API - ajusta según tu configuración
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Interface para la respuesta del endpoint persona/info
 */
interface PersonaInfoResponse {
  succes: boolean;
  message: string;
  result: PersonaInfo[];
}

/**
 * Interface para la respuesta del API al insertar una persona
 */
interface InsertarPersonaResponse {
  success: boolean;
  message: string;
  rowsAffected?: number;
}

/**
 * Interface para los datos completos de persona desde persona/info
 * Actualizada según sp_consultaInformacionPersona
 */
interface PersonaInfo {
  // Campos de persona
  idPersona: number;
  nombre: string;
  ruc?: string;
  dv?: string;
  direccion?: string;
  fechaNacimiento?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  idTipoDocumento?: number;

  // Campos de ubicación
  idCiudad: number;
  nombreCiudad: string;
  idDistrito: number;
  nombreDistrito: string;      // Nombre del distrito
  idDepartamento: number;
  nombreDepartamento: string;  // Nombre del departamento

  // Campos de personaFis
  apellido?: string;

  // Campos de personaJur
  nombreFantasia?: string | null;

  // Campos de proveedor
  responsable?: string | null;
  timbrado?: string | null;

  // Campos de cliente
  idCliente?: number;
  codigo?: number;
  idGrupoCliente?: number;
  nombreGrupoCliente?: string;

  // campos de funcionario
  idFuncionario?: number;
  idSector?: number;
}

/**
 * Servicio para manejar las operaciones relacionadas con Personas
 */
export const personaService = {
  /**
   * Inserta una nueva persona en el sistema
   * @param persona - Datos de la persona a insertar
   * @returns Respuesta del servidor
   */
  insertarPersona: async (persona: Persona): Promise<InsertarPersonaResponse> => {
    try {
      const response = await axios.post<InsertarPersonaResponse>(
        `${API_BASE_URL}/persona`,
        persona
      );
      return response.data;
    } catch (error: any) {
      // Manejar errores del servidor
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Error al insertar la persona');
      }
      throw new Error('Error de conexión con el servidor');
    }
  },

  /**
   * Modifica una persona existente
   * @param persona - Datos de la persona a modificar
   * @returns Respuesta del servidor
   */
  modificarPersona: async (persona: Persona): Promise<InsertarPersonaResponse> => {
    try {
      const response = await axios.put<InsertarPersonaResponse>(
        `${API_BASE_URL}/persona`,
        persona
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Error al modificar la persona');
      }
      throw new Error('Error de conexión con el servidor');
    }
  },

  /**
   * Busca personas por término de búsqueda
   * @param searchTerm - Término a buscar
   * @param searchBy - Campo por el cual buscar
   * @returns Lista de personas encontradas
   */
  buscarPersonas: async (
    searchTerm: string,
    searchBy: number
  ): Promise<Persona[]> => {
    try {
      // TODO: Implementar endpoint de búsqueda en el backend
      const response = await axios.get<Persona[]>(
        `${API_BASE_URL}/persona/consulta`,
        {
          params: {
            "tipoBusqueda": searchBy,
            "busqueda": searchTerm
          }
        }
      );
      console.log(response);
      
      return response.data;
    } catch (error: any) {
      console.error('Error al buscar personas:', error);
      throw new Error('Error al buscar personas');
    }
  },

  /**
   * Obtiene información detallada de una persona por su ID
   * @param idPersona - ID de la persona
   * @returns Información completa de la persona
   */
  obtenerInfoPersona: async (idPersona: number): Promise<PersonaInfo[]> => {
    try {
      const response = await axios.get<PersonaInfoResponse>(
        `${API_BASE_URL}/persona/info`,
        {
          params: {
            idPersona: idPersona
          }
        }
      );
      return response.data.result;
    } catch (error: any) {
      console.error('Error al obtener información de la persona:', error);
      throw new Error('Error al obtener información de la persona');
    }
  },

  /**
   * Busca un cliente por su RUC
   * Si la persona existe pero no es cliente, lo crea automáticamente
   * @param ruc - RUC del cliente a buscar
   * @param idUsuario - ID del usuario que realiza la búsqueda
   * @returns Información completa del cliente
   */
  buscarClientePorRuc: async (ruc: string, idUsuario: number): Promise<PersonaInfo[]> => {
    try {
      const response = await axios.get<PersonaInfoResponse>(
        `${API_BASE_URL}/persona/buscarCliente`,
        {
          params: {
            ruc: ruc,
            idUsuario: idUsuario
          }
        }
      );
      return response.data.result;
    } catch (error: any) {
      console.error('Error al buscar cliente por RUC:', error);
      throw new Error('Error al buscar cliente por RUC');
    }
  },

  /**
   * Consulta clientes por nombre
   * @param busqueda - Término de búsqueda (nombre)
   * @returns Lista de clientes encontrados
   */
  consultaCliente: async (busqueda: string): Promise<any[]> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/persona/consultaCliente`,
        {
          params: {
            busqueda: busqueda
          }
        }
      );
      return response.data.result;
    } catch (error: any) {
      console.error('Error al consultar cliente:', error);
      throw new Error(error.response?.data?.message || 'Error al consultar cliente');
    }
  },

  /**
   * Agrega un cliente usando la vía rápida
   * @param data - Datos para la creación rápida del cliente
   * @returns Datos del cliente creado
   */
  agregarClienteRapido: async (data: any): Promise<any> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/persona/agregarClienteRapido`,
        data
      );
      return response.data.result;
    } catch (error: any) {
      console.error('Error al agregar cliente rápidamente:', error);
      throw new Error(error.response?.data?.message || 'Error al agregar cliente');
    }
  }
};

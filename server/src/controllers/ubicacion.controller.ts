import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";
import {
  DepartamentosResponse,
  DistritosResponse,
  CiudadesResponse
} from "../types/Ubicacion/ubicacion.type";

/**
 * Obtiene todos los departamentos de la base de datos
 */
export const obtenerDepartamentos = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await executeRequest({
      query: 'SELECT * FROM departamento ORDER BY nombre',
      isStoredProcedure: false
    });

    res.status(200).json({
      success: true,
      message: "Departamentos obtenidos exitosamente",
      data: result.recordset
    } as DepartamentosResponse);

  } catch (error: any) {
    console.error("Error en obtenerDepartamentos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener departamentos",
      error: error.message
    });
  }
};

/**
 * Obtiene los distritos de un departamento específico
 * Usa la función funCalcularDistrito_tabla
 */
export const obtenerDistritosPorDepartamento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idDepartamento } = req.query;

    if (!idDepartamento) {
      res.status(400).json({
        success: false,
        message: "El parámetro idDepartamento es requerido"
      });
      return;
    }

    const idDepartamentoNum = parseInt(idDepartamento as string, 10);
    if (isNaN(idDepartamentoNum)) {
      res.status(400).json({
        success: false,
        message: "El parámetro idDepartamento debe ser un número válido"
      });
      return;
    }

    // Usar la función de tabla para obtener distritos
    const result = await executeRequest({
      query: `SELECT d.idDistrito, d.nombre, d.idDepartamento 
              FROM distrito d
              WHERE d.idDepartamento = @idDepartamento
              ORDER BY d.nombre`,
      inputs: [
        {
          name: 'idDepartamento',
          type: sql.Int,
          value: idDepartamentoNum
        }
      ],
      isStoredProcedure: false
    });

    res.status(200).json({
      success: true,
      message: "Distritos obtenidos exitosamente",
      data: result.recordset
    } as DistritosResponse);

  } catch (error: any) {
    console.error("Error en obtenerDistritosPorDepartamento:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener distritos",
      error: error.message
    });
  }
};

/**
 * Obtiene las ciudades de un distrito específico
 * Usa la función funCalcularCiudad_tabla
 */
export const obtenerCiudadesPorDistrito = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idDistrito } = req.query;

    if (!idDistrito) {
      res.status(400).json({
        success: false,
        message: "El parámetro idDistrito es requerido"
      });
      return;
    }

    const idDistritoNum = parseInt(idDistrito as string, 10);
    if (isNaN(idDistritoNum)) {
      res.status(400).json({
        success: false,
        message: "El parámetro idDistrito debe ser un número válido"
      });
      return;
    }

    // Usar la función de tabla para obtener ciudades
    const result = await executeRequest({
      query: `SELECT c.idCiudad, c.nombreCiudad, c.idDistrito 
              FROM ciudad c
              WHERE c.idDistrito = @idDistrito
              ORDER BY c.nombreCiudad`,
      inputs: [
        {
          name: 'idDistrito',
          type: sql.Int,
          value: idDistritoNum
        }
      ],
      isStoredProcedure: false
    });

    res.status(200).json({
      success: true,
      message: "Ciudades obtenidas exitosamente",
      data: result.recordset
    } as CiudadesResponse);

  } catch (error: any) {
    console.error("Error en obtenerCiudadesPorDistrito:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener ciudades",
      error: error.message
    });
  }
};

/**
 * Obtiene todos los países activos de la base de datos
 */
export const obtenerPaises = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await executeRequest({
      query: 'SELECT idPais, nombre, gentilicio, codigo FROM pais WHERE activo = 1 ORDER BY nombre',
      isStoredProcedure: false
    });

    res.status(200).json({
      success: true,
      message: "Países obtenidos exitosamente",
      data: result.recordset
    });
  } catch (error: any) {
    console.error("Error en obtenerPaises:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener países",
      error: error.message
    });
  }
};

/**
 * Obtiene todos los grupos de clientes activos
 */
export const obtenerGruposCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await executeRequest({
      query: 'select idGrupoCliente, nombreGrupoCliente from grupoCliente where activo=1 order by nombreGrupoCliente',
      isStoredProcedure: false
    });

    res.status(200).json({
      success: true,
      message: "Grupos de clientes obtenidos exitosamente",
      data: result.recordset
    });
  } catch (error: any) {
    console.error("Error en obtenerGruposCliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener grupos de clientes",
      error: error.message
    });
  }
};



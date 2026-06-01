import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";
import { InsertarProductoRequest, InsertarProductoResponse, BuscarProductoRequest, ModificarProductoRequest } from "../types/producto/producto.type";

/**
 * Controller para insertar una nueva persona en el sistema.
 *
 * @param req
 * @param res
 *
 */
export const insertarProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    // PASO 1: Extraer todos los datos del body de la petición
    // Usamos destructuring para obtener cada campo del objeto req.body
    const {
      nombre,
      presentacion,
      codigo,
      codigoBarra,
      precio,
      idUsuarioAlta,
      idTipoProducto,
      gasto,
      origen,
      activo,
      idImpuesto
    } = req.body as InsertarProductoRequest;

    // PASO 2: Validar campos obligatorios
    // El nombre y el ID del usuario que da de alta son obligatorios
    if (!nombre || !idUsuarioAlta) {
      res.status(400).json({
        success: false,
        message: "El nombre y usuario son obligatorios"
      });
      return;
    }

    // PASO 5: Preparar los parámetros para el stored procedure
    const inputs = [
      { name: 'nombre', type: sql.VarChar, value: nombre },
      { name: 'presentacion', type: sql.VarChar, value: presentacion || '' },
      { name: 'codigo', type: sql.Int, value: codigo || 0 },
      { name: 'codigoBarra', type: sql.VarChar, value: codigoBarra || '' },
      { name: 'precio', type: sql.Money, value: precio || 0 },
      // Costo se maneja por Stock Inicial
      { name: 'idUsuarioAlta', type: sql.Int, value: idUsuarioAlta },
      { name: 'idTipoProducto', type: sql.Int, value: idTipoProducto || 0 },
      { name: 'gasto', type: sql.Bit, value: gasto || false },
      { name: 'origen', type: sql.Bit, value: origen || false },
      { name: 'activo', type: sql.Bit, value: activo !== undefined ? activo : true },
      { name: 'idImpuesto', type: sql.Int, value: idImpuesto || 0 }
    ];

    const result = await executeRequest({
      query: 'sp_insertarProducto',
      inputs: inputs as any,
      isStoredProcedure: true
    });

// PASO 7: Verificar el resultado y enviar respuesta exitosa
const rowsAffected = result.rowsAffected[0];

res.status(201).json({
  success: true,
  message: "Producto insertado exitosamente",
  rowsAffected: rowsAffected
} as InsertarProductoResponse);

  } catch (error: any) {
  // Lista de códigos de error de validación del SP
  const validationErrorCodes = [50000, 50001, 50002, 50003, 50004];
  // Verificar si es un error personalizado de validación del stored procedure
  if (validationErrorCodes.includes(error.number)) {
    // Devolver HTTP 400 Bad Request con el mensaje exacto del RAISERROR
    res.status(400).json({
      success: false,
      message: error.message || "Error de validación en los datos del producto."
    });
  } else {
    // Error genérico del servidor o de la base de datos
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al insertar el producto.",
      error: error.message
    });
  }
}
};

/**
 * Controller para buscar productos
 */
export const buscarProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipoBusqueda, busqueda } = req.query as any;

    const inputs = [
      { name: 'tipoBusqueda', type: sql.Int, value: parseInt(tipoBusqueda) || 1 },
      { name: 'busqueda', type: sql.VarChar, value: busqueda || '' }
    ];

    const result = await executeRequest({
      query: 'sp_consultaProducto',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    res.status(200).json({
      success: true,
      result: result.recordset
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error al buscar productos",
      error: error.message
    });
  }
};

/**
 * Controller para obtener información de un producto
 */
export const obtenerInfoProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idProducto } = req.query as any;

    const inputs = [
      { name: 'idProducto', type: sql.Int, value: parseInt(idProducto) }
    ];

    const result = await executeRequest({
      query: 'sp_consultaInformacionProducto',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    res.status(200).json({
      success: true,
      result: result.recordset
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error al obtener información del producto",
      error: error.message
    });
  }
};

/**
 * Controller para obtener tipos de producto
 */
export const obtenerTiposProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await executeRequest({
      query: 'select * from v_tipoProducto',
      isStoredProcedure: false
    });

    res.status(200).json(result.recordset);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error al obtener tipos de producto",
      error: error.message
    });
  }
};

/**
 * Controller para consultar precio de producto
 * Ejecuta sp_consultaPrecioProducto que busca por código, código de barra o nombre
 */
export const consultarPrecioProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busqueda, idTerminalWeb } = req.query as any;

    if (!busqueda) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'busqueda' es obligatorio"
      });
      return;
    }

    if (!idTerminalWeb) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'idTerminalWeb' es obligatorio"
      });
      return;
    }

    const inputs = [
      { name: 'busqueda', type: sql.VarChar, value: busqueda },
      { name: 'idTerminalWeb', type: sql.Int, value: parseInt(idTerminalWeb) }
    ];

    const result = await executeRequest({
      query: 'sp_consultaPrecioProducto',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    res.status(200).json({
      success: true,
      result: result.recordset
    });
  } catch (error: any) {
    // Captura el RAISERROR del SP si la terminal no tiene depósito
    if (error.number >= 50000) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al consultar precio del producto",
        error: error.message
      });
    }
  }
}
/**
 * Controller para modificar un producto existente.
 */
export const modificarProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      idProducto,
      nombre,
      presentacion,
      codigo,
      codigoBarra,
      precio,
      origen,
      idUsuarioMod,
      idTipoProducto,
      gasto,
      activo,
      idImpuesto
    } = req.body as ModificarProductoRequest;

    // Validar campos obligatorios
    if (!idProducto || !nombre || !idUsuarioMod) {
      res.status(400).json({
        success: false,
        message: "Los campos 'idProducto', 'nombre' e 'idUsuarioMod' son obligatorios"
      });
      return;
    }

    const inputs = [
      { name: 'idProducto', type: sql.Int, value: idProducto },
      { name: 'nombre', type: sql.VarChar(30), value: nombre },
      { name: 'presentacion', type: sql.VarChar(30), value: presentacion || '' },
      { name: 'codigo', type: sql.Int, value: codigo || 0 },
      { name: 'codigoBarra', type: sql.VarChar(30), value: codigoBarra || '' },
      { name: 'precio', type: sql.Money, value: precio || 0 },
      // Costo no se edita aqui
      { name: 'idUsuarioMod', type: sql.Int, value: idUsuarioMod },
      { name: 'idTipoProducto', type: sql.Int, value: idTipoProducto || 0 },
      { name: 'gasto', type: sql.Bit, value: gasto || false },
      { name: 'origen', type: sql.Bit, value: origen !== undefined ? origen : false },
      { name: 'activo', type: sql.Bit, value: activo !== undefined ? activo : true },
      { name: 'idImpuesto', type: sql.Int, value: idImpuesto || 0 }
    ];

    const result = await executeRequest({
      query: 'sp_modificarProducto',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    const rowsAffected = result.rowsAffected[0];

    res.status(200).json({
      success: true,
      message: "Producto modificado exitosamente",
      rowsAffected: rowsAffected
    });

  } catch (error: any) {
    // Lista de códigos de error de validación del SP
    const validationErrorCodes = [50000, 50001, 50002, 50003, 50004];

    if (validationErrorCodes.includes(error.number)) {
      res.status(400).json({
        success: false,
        message: error.message || "Error de validación en los datos del producto."
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error interno del servidor al modificar el producto.",
        error: error.message
      });
    }
  }
}
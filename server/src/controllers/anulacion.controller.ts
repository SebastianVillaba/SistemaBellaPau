import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';

/**
 * Verifica si un usuario tiene permiso para anular según el tipo indicado.
 * Llama a sp_permisoAnular.
 * 
 * Query params: idUsuario (int), tipo (string: 'FACTU' | 'COMPRA' | 'REMISION' | 'RECEPCION' | 'GASTO' | 'AJUSTE')
 */
export const verificarPermisoAnular = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idUsuario, tipo } = req.query as { idUsuario: string; tipo: string };

    if (!idUsuario || !tipo) {
      res.status(400).json({
        success: false,
        message: "Los parámetros 'idUsuario' y 'tipo' son obligatorios"
      });
      return;
    }

    const tiposValidos = ['FACTU', 'COMPRA', 'REMISION', 'RECEPCION', 'GASTO', 'AJUSTE'];
    if (!tiposValidos.includes(tipo.toUpperCase())) {
      res.status(400).json({
        success: false,
        message: `El tipo '${tipo}' no es válido. Tipos permitidos: ${tiposValidos.join(', ')}`
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_permisoAnular',
      inputs: [
        { name: 'idUsuario', type: sql.Int, value: parseInt(idUsuario) },
        { name: 'tipo', type: sql.VarChar(15), value: tipo.toUpperCase() }
      ] as any,
      isStoredProcedure: true
    });

    // El SP retorna una fila con idUsuario si tiene permiso, o sin filas si no lo tiene
    const tienePermiso = result.recordset && result.recordset.length > 0;

    res.status(200).json({
      success: true,
      tienePermiso
    });

  } catch (error: any) {
    console.error('Error al verificar permiso de anulación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar el permiso de anulación',
      error: error.message
    });
  }
};

/**
 * Anula una facturación (venta).
 * Llama a sp_anularFacturacion.
 * 
 * Body: { idVenta, idTerminalWeb, idSucursal, idUsuarioAlta, explica, tipo }
 *   tipo = 1 (Factura impresa) | 2 (Remito/CVE)
 */
export const anularFacturacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      idVenta,
      idTerminalWeb,
      idSucursal,
      idUsuarioAlta,
      explica,
      tipo
    } = req.body;

    // Validar parámetros obligatorios
    if (!idVenta || !idTerminalWeb || !idSucursal || !idUsuarioAlta || !explica || tipo === undefined) {
      res.status(400).json({
        success: false,
        message: "Faltan parámetros requeridos: idVenta, idTerminalWeb, idSucursal, idUsuarioAlta, explica, tipo"
      });
      return;
    }

    if (tipo !== 1 && tipo !== 2) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'tipo' debe ser 1 (factura impresa) o 2 (remito)"
      });
      return;
    }

    await executeRequest({
      query: 'sp_anularFacturacion',
      inputs: [
        { name: 'idVenta',       type: sql.Int,         value: idVenta        },
        { name: 'idTerminalWeb', type: sql.Int,         value: idTerminalWeb  },
        { name: 'idSucursal',    type: sql.Int,         value: idSucursal     },
        { name: 'idUsuarioAlta', type: sql.Int,         value: idUsuarioAlta  },
        { name: 'explica',       type: sql.VarChar(sql.MAX), value: explica    },
        { name: 'tipo',          type: sql.Numeric(2),  value: tipo           }
      ] as any,
      isStoredProcedure: true
    });

    res.status(200).json({
      success: true,
      message: 'Facturación anulada correctamente'
    });

  } catch (error: any) {
    console.error('Error al anular facturación:', error);
    // Errores de lógica de negocio del SP (raiserror)
    if (error.number >= 50000) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al anular la facturación',
        error: error.message
      });
    }
  }
};

import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';

/**
 * Consulta ventas por número de factura.
 * Llama a sp_consultaVentaNroFactura.
 * 
 * Query params: dsuc (numeric), dcaja (numeric), dfactu (numeric)
 */
export const consultaVentaNroFactura = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dsuc, dcaja, dfactu } = req.query as { dsuc: string; dcaja: string; dfactu: string };

    if (!dsuc || !dcaja || !dfactu) {
      res.status(400).json({
        success: false,
        message: "Los parámetros 'dsuc', 'dcaja' y 'dfactu' son obligatorios"
      });
      return;
    }

    const inputs = [
      { name: 'dsuc',   type: sql.Numeric(3, 0), value: parseInt(dsuc)   },
      { name: 'dcaja',  type: sql.Numeric(3, 0), value: parseInt(dcaja)  },
      { name: 'dfactu', type: sql.Numeric(3, 0), value: parseInt(dfactu) }
    ];

    const result = await executeRequest({
      query: 'sp_consultaVentaNroFactura',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    res.status(200).json({
      success: true,
      result: result.recordset
    });

  } catch (error: any) {
    console.error('Error al consultar venta por nro factura:', error);
    if (error.number >= 50000) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al consultar la venta por número de factura',
        error: error.message
      });
    }
  }
};

/**
 * Consulta ventas por rango de fechas.
 * Llama a sp_consultaVentaFecha.
 * 
 * Query params: desde (date), hasta (date), imp (bit: 1=impreso, 0=remito)
 */
export const consultaVentaFecha = async (req: Request, res: Response): Promise<void> => {
  try {
    const { desde, hasta, imp } = req.query as { desde: string; hasta: string; imp: string };

    if (!desde || !hasta || imp === undefined || imp === null) {
      res.status(400).json({
        success: false,
        message: "Los parámetros 'desde', 'hasta' e 'imp' son obligatorios"
      });
      return;
    }

    const inputs = [
      { name: 'desde', type: sql.Date, value: desde },
      { name: 'hasta', type: sql.Date, value: hasta },
      { name: 'imp',   type: sql.Bit,  value: parseInt(imp) }
    ];

    const result = await executeRequest({
      query: 'sp_consultaVentaFecha',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    res.status(200).json({
      success: true,
      result: result.recordset
    });

  } catch (error: any) {
    console.error('Error al consultar ventas por fecha:', error);
    if (error.number >= 50000) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al consultar ventas por fecha',
        error: error.message
      });
    }
  }
};

/**
 * Consulta información detallada de una venta.
 * Llama a sp_consultaInformacionVenta.
 * Retorna 2 recordsets: cabecera de la venta y detalle de productos.
 * 
 * Query params: idVenta (int)
 */
export const consultaInformacionVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idVenta } = req.query as { idVenta: string };

    if (!idVenta) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'idVenta' es obligatorio"
      });
      return;
    }

    const inputs = [
      { name: 'idVenta', type: sql.Int, value: parseInt(idVenta) }
    ];

    const result = await executeRequest({
      query: 'sp_consultaInformacionVenta',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    // El SP retorna 2 recordsets: [0] = cabecera, [1] = detalle de productos
    const recordsets = result.recordsets as any[];
    const cabecera = recordsets[0] || [];
    const detalle = recordsets[1] || [];

    res.status(200).json({
      success: true,
      cabecera: cabecera.length > 0 ? cabecera[0] : null,
      detalle: detalle
    });

  } catch (error: any) {
    console.error('Error al consultar información de venta:', error);
    if (error.number >= 50000) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al consultar la información de la venta',
        error: error.message
      });
    }
  }
};

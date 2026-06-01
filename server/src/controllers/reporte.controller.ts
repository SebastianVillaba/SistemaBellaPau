import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';
import { generateVentasProductoPdf } from '../utils/pdfGenerator';


/**
 * Controller para obtener el reporte de factura de venta
 * @param req - Request con el parámetro idVenta
 * @param res - Response con los datos de la factura
 */
export const reporteFacturaVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idVenta } = req.query;

    if (!idVenta) {
      res.status(400).json({
        success: false,
        message: 'El parámetro idVenta es requerido'
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_reporteFacturaVenta',
      isStoredProcedure: true,
      inputs: [
        {
          name: 'idVenta',
          type: sql.Int,
          value: parseInt(idVenta as string)
        }
      ]
    });

    // El SP devuelve 2 recordsets:
    // recordset[0] = Cabecera y liquidación
    // recordset[1] = Detalle de items

    const recordsets = (result as typeof result & { recordsets?: any[] }).recordsets;

    res.status(200).json({
      success: true,
      message: 'Reporte generado exitosamente',
      cabecera: recordsets?.[0]?.[0] ?? null,
      items: recordsets?.[1] ?? []
    });
  } catch (error) {
    console.error('Error al generar reporte de factura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de factura',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Controller para obtener el reporte del ticket de un pedido
 */
export const reporteTicketPedidoDia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idPedido, nro } = req.query;

    if (!idPedido || !nro) {
      res.status(400).json({
        success: false,
        message: 'Los parámetros idPedido y nro son requeridos'
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_reporteTicketPedidoDia',
      isStoredProcedure: true,
      inputs: [
        { name: 'idPedido', type: sql.Int, value: parseInt(idPedido as string, 10) },
        { name: 'nro', type: sql.Int, value: parseInt(nro as string, 10) }
      ]
    });

    const recordsets = (result as typeof result & { recordsets?: any[] }).recordsets;

    res.status(200).json({
      success: true,
      message: 'Reporte de ticket de pedido generado exitosamente',
      cabecera: recordsets?.[0]?.[0] ?? null,
      items: recordsets?.[1] ?? []
    });
  } catch (error) {
    console.error('Error al generar reporte de ticket de pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el ticket del pedido',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Controller para obtener el reporte de ticket de venta
 * @param req - Request con el parámetro idVenta
 * @param res - Response con los datos del ticket
 */
export const reporteTicketVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idVenta } = req.query;

    if (!idVenta) {
      res.status(400).json({
        success: false,
        message: 'El parámetro idVenta es requerido'
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_reporteTicketVenta',
      isStoredProcedure: true,
      inputs: [
        {
          name: 'idVenta',
          type: sql.Int,
          value: parseInt(idVenta as string)
        }
      ]
    });

    // El SP devuelve 2 recordsets:
    // recordset[0] = Cabecera
    // recordset[1] = Detalle de items

    const recordsets = (result as typeof result & { recordsets?: any[] }).recordsets;

    res.status(200).json({
      success: true,
      message: 'Reporte de ticket generado exitosamente',
      cabecera: recordsets?.[0]?.[0] ?? null,
      items: recordsets?.[1] ?? []
    });
  } catch (error) {
    console.error('Error al generar reporte de ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de ticket',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Controller para obtener el reporte de cierre de caja
 * @param req - Request con el parámetro idMovimientoCaja
 * @param res - Response con los datos del cierre
 */
export const reporteCierreCaja = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idMovimientoCaja } = req.query;

    if (!idMovimientoCaja) {
      res.status(400).json({
        success: false,
        message: 'El parámetro idMovimientoCaja es requerido'
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_reporteCierreCaja',
      isStoredProcedure: true,
      inputs: [
        {
          name: 'idMovimientoCaja',
          type: sql.Int,
          value: parseInt(idMovimientoCaja as string)
        }
      ]
    });

    // El SP devuelve 2 recordsets:
    // recordset[0] = Resumen general y balance
    // recordset[1] = Detalle de gastos

    const recordsets = (result as typeof result & { recordsets?: any[] }).recordsets;

    res.status(200).json({
      success: true,
      message: 'Reporte de cierre de caja generado exitosamente',
      resumen: recordsets?.[0]?.[0] ?? null,
      gastos: recordsets?.[1] ?? []
    });
  } catch (error) {
    console.error('Error al generar reporte de cierre de caja:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de cierre de caja',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Controller para obtener el reporte de ticket de remisión
 * @param req - Request con el parámetro idRemision
 * @param res - Response con los datos del ticket
 */
export const reporteTicketRemision = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idRemision } = req.query;

    if (!idRemision) {
      res.status(400).json({
        success: false,
        message: 'El parámetro idRemision es requerido'
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_reporteTicketRemision',
      isStoredProcedure: true,
      inputs: [
        {
          name: 'idRemision',
          type: sql.Int,
          value: parseInt(idRemision as string)
        }
      ]
    });

    // El SP devuelve 2 recordsets:
    // recordset[0] = Cabecera
    // recordset[1] = Detalle de items

    const recordsets = (result as typeof result & { recordsets?: any[] }).recordsets;

    res.status(200).json({
      success: true,
      message: 'Reporte de ticket de remisión generado exitosamente',
      cabecera: recordsets?.[0]?.[0] ?? null,
      items: recordsets?.[1] ?? []
    });
  } catch (error) {
    console.error('Error al generar reporte de ticket de remisión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de ticket de remisión',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Controller para obtener el reporte de pedido delivery
 * @param req - Request con el parámetro idDelivery y fecha
 * @param res - Response con los datos del reporte
 */
export const reportePedidoDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idDelivery, fecha } = req.query;

    if (!idDelivery || !fecha) {
      res.status(400).json({
        success: false,
        message: 'Los parámetros idDelivery y fecha son requeridos'
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_reportePedidoDelivery',
      isStoredProcedure: true,
      inputs: [
        {
          name: 'idDelivery',
          type: sql.Int,
          value: parseInt(idDelivery as string)
        },
        {
          name: 'fecha',
          type: sql.Date,
          value: new Date(fecha as string)
        }
      ]
    });

    const recordsets = (result as typeof result & { recordsets?: any[] }).recordsets;

    res.status(200).json({
      success: true,
      message: 'Reporte de pedido por delivery generado exitosamente',
      data: recordsets?.[0] ?? []
    });
  } catch (error) {
    console.error('Error al generar reporte de pedido por delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de pedido por delivery',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * Controller para obtener el reporte de venta de producto por día
 * @param req - Request con el parámetro fecha y opcionalmente format (ej. format=pdf)
 * @param res - Response con los datos del reporte o el archivo PDF
 */
export const reporteVentaProductoDia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fecha, format } = req.query;

    if (!fecha) {
      res.status(400).json({
        success: false,
        message: 'El parámetro fecha es requerido'
      });
      return;
    }

    const result = await executeRequest({
      query: 'sp_reporteVentaProductoDia',
      isStoredProcedure: true,
      inputs: [
        {
          name: 'fecha',
          type: sql.Date,
          value: new Date(fecha as string)
        }
      ]
    });

    const recordsets = (result as typeof result & { recordsets?: any[] }).recordsets;
    const data = recordsets?.[0] ?? [];

    if (format === 'pdf') {
      return generateVentasProductoPdf(res, data, fecha as string);
    }

    res.status(200).json({
      success: true,
      message: 'Reporte de venta de producto por día generado exitosamente',
      data: data
    });
  } catch (error) {
    console.error('Error al generar reporte de venta de producto por día:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de venta de producto por día',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

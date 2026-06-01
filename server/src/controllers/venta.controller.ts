import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';


/**
 * Controller para agregar un item al detalle de venta temporal (carrito).
 */
export const agregarDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idTerminalWeb, idUsuario, idProducto, idStock, cantidad, precioUnitario, precioDescuento } = req.body;

    if (!idTerminalWeb) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'idTerminalWeb' es obligatorio"
      });
      return;
    }

    if (!idUsuario) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'idUsuario' es obligatorio"
      });
      return;
    }

    if (!idProducto || !idStock || !cantidad || precioUnitario === undefined) {
      res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos (idProducto, idStock, cantidad, precioUnitario).'
      });
      return;
    }

    const inputs = [
      { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
      { name: 'idProducto', type: sql.Int, value: idProducto },
      { name: 'idStock', type: sql.Int, value: idStock },
      { name: 'cantidad', type: sql.Numeric(10, 4), value: cantidad },
      { name: 'precioUnitario', type: sql.Money, value: precioUnitario },
      { name: 'precioDescuento', type: sql.Money, value: precioDescuento || 0 }
    ];

    await executeRequest({
      query: 'sp_agregarDetVentaTmp',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    res.status(201).json({
      success: true,
      message: 'Producto agregado al detalle de venta.'
    });

  } catch (error: any) {
    if (error.number >= 50000) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al agregar producto al detalle de venta",
        error: error.message
      });
    }
  }
};

/**
 * Controller para consultar los items del detalle de venta temporal (carrito).
 */
export const consultarDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idTerminalWeb, idUsuario } = req.query as any;

    if (!idTerminalWeb) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'idTerminalWeb' es obligatorio"
      });
      return;
    }

    if (!idUsuario) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'idUsuario' es obligatorio"
      });
      return;
    }

    const inputs = [
      { name: 'idTerminalWeb', type: sql.Int, value: parseInt(idTerminalWeb) },
      { name: 'idUsuario', type: sql.Int, value: parseInt(idUsuario) }
    ];

    const result = await executeRequest({
      query: 'sp_consultaDetVentaTmp',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    console.log('Resultado de sp_consultaDetVentaTmp:', result.recordset);

    res.status(200).json({
      success: true,
      result: result.recordset
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error al consultar el detalle de la venta",
      error: error.message
    });
  }
};

/**
 * Controller para eliminar un item del detalle de venta temporal
 */
export const eliminarDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idTerminalWeb, idDetVentaTmp } = req.query as any;

    if (!idTerminalWeb) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'idTerminalWeb' es obligatorio"
      });
      return;
    }

    if (!idDetVentaTmp) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'idDetVentaTmp' es obligatorio"
      });
      return;
    }

    const inputs = [
      { name: 'idTerminalWeb', type: sql.Int, value: parseInt(idTerminalWeb) },
      { name: 'idDetVentaTmp', type: sql.Int, value: parseInt(idDetVentaTmp) }
    ];

    await executeRequest({
      query: 'sp_eliminarDetVentaTmp',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    res.status(200).json({
      success: true,
      message: 'Producto eliminado del detalle de venta'
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar producto del detalle de venta",
      error: error.message
    });
  }
};

/**
 * Controller para guardar una venta (finalizar venta)
 */
export const guardarVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      idUsuarioAlta,
      idTerminalWeb,
      idPersonaJur,
      idMovimientoCaja,
      idTipoPago,
      idTipoVenta,
      idCliente,
      ruc,
      nombreCliente,
      totalVenta,
      totalDescuento,
      ticket
    } = req.body;

    // Validar parámetros obligatorios
    if (!idUsuarioAlta || !idTerminalWeb || !idPersonaJur || !idMovimientoCaja ||
      !idTipoPago || !idTipoVenta || totalVenta === undefined || ticket === undefined) {
      res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos para guardar la venta.'
      });
      return;
    }

    const inputs = [
      { name: 'idUsuarioAlta', type: sql.Int, value: idUsuarioAlta },
      { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
      { name: 'idPersonaJur', type: sql.Int, value: idPersonaJur },
      { name: 'idMovimientoCaja', type: sql.Int, value: idMovimientoCaja },
      { name: 'idTipoPago', type: sql.Int, value: idTipoPago },
      { name: 'idTipoVenta', type: sql.Int, value: idTipoVenta },
      { name: 'idCliente', type: sql.Int, value: idCliente || null },
      { name: 'ruc', type: sql.VarChar(15), value: ruc || '' },
      { name: 'nombreCliente', type: sql.VarChar(60), value: nombreCliente || '' },
      { name: 'totalVenta', type: sql.Money, value: totalVenta },
      { name: 'totalDescuento', type: sql.Money, value: totalDescuento || 0 },
      { name: 'ticket', type: sql.Bit, value: ticket }
    ];

    const result = await executeRequest({
      query: 'sp_guardarVenta',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    // El SP retorna el idVenta generado en el recordset
    const idVenta = result.recordset && result.recordset[0] ? result.recordset[0].idVenta : null;

    res.status(201).json({
      success: true,
      message: 'Venta guardada exitosamente',
      idVenta: idVenta
    });

  } catch (error: any) {
    if (error.number >= 50000) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al guardar la venta",
        error: error.message
      });
    }
  }
};

export const consultaFacturaCorrelativa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idTerminalWeb } = req.query as any;

    if (!idTerminalWeb) {
      res.status(400).json({
        success: false,
        message: "El parámetro 'idTerminalWeb' es obligatorio"
      });
      return;
    }

    const inputs = [
      { name: 'idTerminalWeb', type: sql.Int, value: parseInt(idTerminalWeb) }
    ];

    const result = await executeRequest({
      query: '[sp_consultaFacturaActual]',
      inputs: inputs as any,
      isStoredProcedure: true
    });

    res.status(200).json({
      success: true,
      result: result.recordset
    });
  } catch (error: any) {
    if (error.number >= 50000) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Error al consultar la factura actual",
        error: error.message
      });
    }
  }
}


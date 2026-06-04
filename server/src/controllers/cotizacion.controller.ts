import { Request, Response } from 'express';
import { executeRequest } from '../utils/dbHandler';

/**
 * Controller to get active currencies and their exchange rates
 */
export const getCotizaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await executeRequest({
      query: 'SELECT idMoneda, nombre, simbolo, cotizacion, activo FROM moneda WHERE activo = 1',
      isStoredProcedure: false
    });

    res.status(200).json({
      success: true,
      result: result.recordset
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al consultar las cotizaciones',
      error: error.message
    });
  }
};

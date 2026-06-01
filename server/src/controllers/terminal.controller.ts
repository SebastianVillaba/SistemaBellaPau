import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';
import { logger } from '../utils/logger';

export const validarTerminal = async (req: Request, res: Response) => {
  const { terminalToken } = req.body;

  if (!terminalToken) {
    return res.status(400).json({ success: false, message: 'terminalToken es requerido' });
  }

  try {
    const result = await executeRequest({
      isStoredProcedure: true,
      query: 'sp_consultaTerminalWeb',
      inputs: [
        { name: 'terminalToken', type: sql.VarChar(50), value: terminalToken },
      ],
    });

    if (result.recordset.length > 0) {
      const terminalConfig = result.recordset[0];

      logger.info(`Terminal validada: ${terminalConfig.idTerminalWeb} para el token: ${terminalToken}`);

      return res.json({
        success: true,
        message: 'Terminal validada correctamente',
        terminal: {
          idTerminalWeb: terminalConfig.idTerminalWeb,
          nombreSucursal: terminalConfig.nombreSucursal,
          nombreDeposito: terminalConfig.nombreDeposito,
          token: terminalToken
        }
      });
    } else {
      logger.warn(`Token de terminal no válido: ${terminalToken}`);
      return res.status(404).json({
        success: false,
        message: 'Terminal no encontrada o no válida',
        token: terminalToken
      });
    }
  } catch (error: any) {
    logger.error('Error al validar la terminal:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

export const obtenerTerminalInfo = async (req: Request, res: Response) => {
  const { idTerminalWeb } = req.query;

  try {
    const response = await executeRequest({
      query: `select * from [dbo].[funObtenerInfoTerminalWeb] (${idTerminalWeb})`
    })

    if (response.recordset.length > 0) {
      const terminalConfig = response.recordset[0];

      return res.json({
        success: true,
        terminal: terminalConfig
      });
    } else {
      logger.warn(`Error al obtener informacion de la terminal.`);
      return res.status(404).json({
        success: false,
        message: 'Terminal no encontrada o no válida'
      });
    }
  } catch (error) {

  }
}

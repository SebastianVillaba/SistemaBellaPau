import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';

export const getDeliveryActivo = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'sp_consultaDeliveryActivo',
            isStoredProcedure: true,
            inputs: [ { name: 'idTerminalWeb', type: sql.Int, value: 1 } ]
        });
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al consultar delivery activo:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al consultar delivery activo', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al consultar delivery activo', error: 'An unknown error occurred' });
        }
    }
};

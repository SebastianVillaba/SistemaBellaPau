import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';

export const consultaSectoresActivos = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await executeRequest({
            query: 'select * from sector where activo=1',
            isStoredProcedure: false
        });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al consultar sectores activos:', error);
        res.status(500).json({ error: 'Error al consultar sectores activos' });
    }
};
import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';

export const getDenominacionActivo = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'select * from denominacion where activo=1',
            isStoredProcedure: false
        });
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al consultar denominacion activo:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al consultar denominacion activo', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al consultar denominacion activo', error: 'An unknown error occurred' });
        }
    }
};  

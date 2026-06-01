import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';

/**
 * * * * * * * * * * * * * * * * * * * * 
 *  ESTA ES LA ZONA DE AJUSTES         *
 * * * * * * * * * * * * * * * * * * * *
 */

export const agregarDetAjusteStockTmp = async (req: Request, res: Response) => {
    const { idTerminalWeb, idStock, cantidad, esNegativo } = req.body;
    try {
        const result = await executeRequest({
            query: 'sp_agregarDetAjusteStockTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idStock', type: sql.Int, value: idStock },
                { name: 'cantidad', type: sql.Numeric(10,4), value: cantidad },
                { name: 'esNegativo', type: sql.Bit, value: esNegativo }
            ]
        });
        res.status(200).json({ message: 'Detalle de ajuste de stock tmp agregado exitosamente', result });
    } catch (error: any) {
        console.error('Error al agregar detalle de ajuste de stock tmp', error);
        res.status(500).json({ error: 'Error al agregar detalle de ajuste de stock tmp' });
    }
}

export const eliminarDetAjusteStockTmp = async (req: Request, res: Response) => {
    const { idTerminalWeb, idDetAjusteStockTmp } = req.body;
    try {
        const result = await executeRequest({
            query: 'sp_eliminarDetAjusteStockTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idDetAjusteStockTmp', type: sql.Int, value: idDetAjusteStockTmp }
            ]
        });
        res.status(200).json({ message: 'Detalle de ajuste de stock tmp eliminado exitosamente', result });
    } catch (error: any) {
        console.error('Error al eliminar detalle de ajuste de stock tmp', error);
        res.status(500).json({ error: 'Error al eliminar detalle de ajuste de stock tmp' });
    }
}

export const consultaDetAjusteStockTmp = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'sp_consultaDetAjusteStockTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: req.query.idTerminalWeb },
                { name: 'idTipoAjuste', type: sql.Int, value: req.query.idTipoAjuste }
            ]
        });
        res.status(200).json({ message: 'Detalle de ajuste de stock tmp consultado exitosamente', result });
    } catch (error: any) {
        console.error('Error al consultar detalle de ajuste de stock tmp', error);
        res.status(500).json({ error: 'Error al consultar detalle de ajuste de stock tmp' });
    }
}

export const guardarAjusteStock = async (req: Request, res: Response) => {
    const { idUsuario, idTerminalWeb, idDeposito, idTipoAjuste, motivo } = req.body;
    try {
        const result = await executeRequest({
            query: 'sp_guardarAjusteStock',
            isStoredProcedure: true,
            inputs: [
                { name: 'idUsuario', type: sql.Int, value: idUsuario },
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idDeposito', type: sql.Int, value: idDeposito },
                { name: 'idTipoAjuste', type: sql.Int, value: idTipoAjuste },
                { name: 'motivo', type: sql.VarChar(255), value: motivo }
            ]
        });
        res.status(200).json({ message: 'Ajuste de stock procesado exitosamente', result });
    } catch (error:any) {
        console.error('Error al procesar ajuste de stock', error);
        res.status(500).json({ error: 'Error al procesar ajuste de stock' });
    }
}

export const consultaTipoAjuste = async (req:Request, res:Response) => {
    try {
        const result = await executeRequest({
            query: 'select * from tipoAjuste',
            isStoredProcedure: false
        })
        res.status(200).json({ message: 'Tipo de ajuste consultado exitosamente', result });
    } catch (error: any) {
        console.error('Error al consultar tipo de ajuste', error);
        res.status(500).json({ error: 'Error al consultar tipo de ajuste' });
    }
}
import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';
import { logger } from '../utils/logger';
import { CrearTerminalWebRequest, ModificarTerminalWebRequest } from '../types/terminalWeb.type';

export const crearTerminalWeb = async (req: Request, res: Response) => {
    const { nombreTerminal, terminalToken, idSucursal, idFactura, idDepositoVenta, idDepositoCompra, idDepositoRemision, idUsuarioAlta } = req.body as CrearTerminalWebRequest;

    try {
        await executeRequest({
            isStoredProcedure: true,
            query: 'sp_crearTerminalWeb',
            inputs: [
                { name: 'nombreTerminal', type: sql.VarChar(40), value: nombreTerminal },
                { name: 'terminalToken', type: sql.VarChar(50), value: terminalToken },
                { name: 'idSucursal', type: sql.Int, value: idSucursal },
                { name: 'idFactura', type: sql.Int, value: idFactura },
                { name: 'idDepositoVenta', type: sql.Int, value: idDepositoVenta },
                { name: 'idDepositoCompra', type: sql.Int, value: idDepositoCompra },
                { name: 'idDepositoRemision', type: sql.Int, value: idDepositoRemision },
                { name: 'idUsuarioAlta', type: sql.Int, value: idUsuarioAlta }
            ]
        });

        res.json({ success: true, message: 'Terminal Web creada exitosamente' });
    } catch (error: any) {
        logger.error('Error al crear terminal web:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const modificarTerminalWeb = async (req: Request, res: Response) => {
    const { idTerminalWeb, nombreTerminal, terminalToken, idSucursal, idFactura, idDepositoVenta, idDepositoCompra, idDepositoRemision, activo, idUsuarioMod } = req.body as ModificarTerminalWebRequest;

    try {
        await executeRequest({
            isStoredProcedure: true,
            query: 'sp_modificarTerminalWeb',
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'nombreTerminal', type: sql.VarChar(40), value: nombreTerminal },
                { name: 'terminalToken', type: sql.VarChar(50), value: terminalToken },
                { name: 'idSucursal', type: sql.Int, value: idSucursal },
                { name: 'idFactura', type: sql.Int, value: idFactura },
                { name: 'idDepositoVenta', type: sql.Int, value: idDepositoVenta },
                { name: 'idDepositoCompra', type: sql.Int, value: idDepositoCompra },
                { name: 'idDepositoRemision', type: sql.Int, value: idDepositoRemision },
                { name: 'activo', type: sql.Bit, value: activo },
                { name: 'idUsuarioMod', type: sql.Int, value: idUsuarioMod }
            ]
        });

        res.json({ success: true, message: 'Terminal Web modificada exitosamente' });
    } catch (error: any) {
        logger.error('Error al modificar terminal web:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const buscarTerminalWeb = async (req: Request, res: Response) => {
    const { busqueda } = req.query;

    try {
        const result = await executeRequest({
            isStoredProcedure: true,
            query: 'sp_buscarTerminalWeb',
            inputs: [
                { name: 'busqueda', type: sql.VarChar(40), value: busqueda || '' }
            ]
        });

        res.json(result.recordset);
    } catch (error: any) {
        logger.error('Error al buscar terminales web:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const obtenerTerminalWeb = async (req: Request, res: Response) => {
    const { idTerminalWeb } = req.params;

    try {
        const result = await executeRequest({
            isStoredProcedure: true,
            query: 'sp_consultaInformacionTerminalWeb',
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb }
            ]
        });

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ success: false, message: 'Terminal Web no encontrada' });
        }
    } catch (error: any) {
        logger.error('Error al obtener terminal web:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

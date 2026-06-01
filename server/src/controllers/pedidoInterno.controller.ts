import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';

interface IAgregarDetallePedidoInternoDTO {
    idTerminalWeb: number;
    idProducto: number;
    cantidadSolicitada: number;
}

interface IGuardarPedidoInternoDTO {
    idUsuario: number;
    idTerminalWeb: number;
    idSucursalProveedor: number;
    fechaNecesaria: string;
    observacion: string;
}

export const agregarDetPedidoInternoTmp = async (req: Request,res: Response) => {
    const {
        idTerminalWeb,
        idProducto,
        cantidadSolicitada
    }: IAgregarDetallePedidoInternoDTO = req.body;

    try {
        await executeRequest({
            query: 'sp_agregarDetPedidoInternoTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idProducto', type: sql.Int, value: idProducto },
                { name: 'cantidadSolicitada', type: sql.Numeric(10, 4), value: cantidadSolicitada }
            ]
        });
        res.status(200).json({ message: 'Detalle de pedido interno agregado correctamente.' });
    } catch (error: any) {
        console.error('Error al agregar detalle de pedido interno:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al agregar detalle', error: error.message || 'Error desconocido' });
    }
}

export const eliminarDetPedidoInternoTmp = async (req: Request,res: Response) => {
    const { 
        idTerminalWeb,
        idDetPedidoInternoTmp
    } = req.body;
    try {
        await executeRequest({
            query: 'sp_eliminarDetPedidoInternoTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idDetPedidoInternoTmp', type: sql.Int, value: idDetPedidoInternoTmp }
            ]
        });
        res.status(200).json({ message: 'Detalle de pedido interno eliminado correctamente.' });
    } catch (error: any) {
        console.error('Error al eliminar detalle de pedido interno:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al eliminar detalle', error: error.message || 'Error desconocido' });
    }
}

export const guardarPedidoInterno = async (req: Request, res: Response) => {
    const {
        idUsuario,
        idTerminalWeb,
        idSucursalProveedor,
        fechaNecesaria,
        observacion
    }: IGuardarPedidoInternoDTO = req.body;
    try {
        const result = await executeRequest({
            query: 'sp_guardarPedidoInterno',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idSucursalProveedor', type: sql.Int, value: idSucursalProveedor },
                { name: 'fechaNecesaria', type: sql.VarChar, value: fechaNecesaria },
                { name: 'idUsuario', type: sql.Int, value: idUsuario },
                { name: 'observacion', type: sql.VarChar, value: observacion }
            ]
        });
        res.status(200).json({ message: 'Pedido interno guardado correctamente.', data: result.recordset });
    } catch (error: any) {
        console.error('Error al guardar pedido interno:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al guardar pedido interno', error: error.message || 'Error desconocido' });
    }
}

export const consultaPedidosInternosRecibidos = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'sp_consultaPedidosInternosRecibidos',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: req.query.idTerminalWeb }
            ]
        })
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error('Error al consultar pedidos internos recibidos:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al consultar pedidos internos pendientes', error: error.message || 'Error desconocido' });
    }
}

export const consultaDetPedidoInternoTmp = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'sp_consultaDetPedidoInternoTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: req.query.idTerminalWeb }
            ]
        })
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error('Error al consultar detalles de pedido interno temporal:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al consultar detalles de pedido interno temporal', error: error.message || 'Error desconocido' });
    }
}

export const consultaDetPedidoInternoEntrante = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'sp_consultaDetPedidosInternosEntrantes',
            isStoredProcedure: true,
            inputs: [
                { name: 'idPedidoInterno', type: sql.Int, value: req.query.idPedidoInterno }
            ]
        })
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error('Error al consultar detalles de pedido interno entrante:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al consultar detalles de pedido interno entrante', error: error.message || 'Error desconocido' });
    }
}


export const consultaSucursales = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: `select * from [dbo].[funSucursalesActivos] (2)`,
            isStoredProcedure: false
        })
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error('Error al consultar sucursales:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al consultar sucursales', error: error.message || 'Error desconocido' });
    }
}
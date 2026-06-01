import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';

// Interfaces
export interface IAgregarDetalleRemisionDTO {
    idTerminalWeb: number;
    idProducto: number;
    idStock: number;
    cantidadEnviada: number;
}

export interface IGuardarRemisionDTO {
    idUsuario: number;
    idTerminalWeb: number;
    idDepositoDestino: number;
    idPedidoInterno: number;
    observacion: string;
}

export interface IRecibirRemisionDTO {
    idRemision: number;
    idUsuarioReceptor: number;
}

// Controller Methods

export const consultarStock = async (req: Request, res: Response) => {
    const { busqueda, idTerminalWeb } = req.query;

    try {
        const result = await executeRequest({
            query: 'sp_consultaStockParaRemision',
            isStoredProcedure: true,
            inputs: [
                { name: 'busqueda', type: sql.VarChar(20), value: String(busqueda) },
                { name: 'idTerminalWeb', type: sql.Int, value: Number(idTerminalWeb) }
            ]
        });
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error('Error al consultar stock para remisión:', error);
        res.status(500).json({ message: 'Error al consultar stock', error: error.message || 'Error desconocido' });
    }
};

export const consultaDetalleRemisionTmp = async (req: Request, res: Response) => {
    const { idTerminalWeb } = req.query;
    if (!idTerminalWeb) {
        return res.status(400).json({ message: "El idTerminalWeb es obligatorio" })
    }
    try {
        const result = await executeRequest({
            query: 'sp_consultaDetRemisionTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: Number(req.query.idTerminalWeb) }
            ]
        })
        console.log("SOY LOS RESULTADOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOS", result);

        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error('Error al consultar detalle de remisión:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al consultar detalle de remisión', error: error.message || 'Error desconocido' });
    }
}

export const agregarDetalleRemision = async (req: Request, res: Response) => {
    const {
        idTerminalWeb,
        idProducto,
        idStock,
        cantidadEnviada
    }: IAgregarDetalleRemisionDTO = req.body;

    try {
        await executeRequest({
            query: 'sp_agregarDetRemisionTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idProducto', type: sql.Int, value: idProducto },
                { name: 'idStock', type: sql.Int, value: idStock },
                { name: 'cantidadEnviada', type: sql.Numeric(10, 4), value: cantidadEnviada }
            ]
        });
        res.status(200).json({ message: 'Detalle de remisión agregado correctamente.' });
    } catch (error: any) {
        console.error('Error al agregar detalle de remisión:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al agregar detalle', error: error.message || 'Error desconocido' });
    }
};

export const guardarRemision = async (req: Request, res: Response) => {
    const {
        idUsuario,
        idTerminalWeb,
        idDepositoDestino,
        idPedidoInterno,
        observacion
    }: IGuardarRemisionDTO = req.body;

    console.log(req.body);


    try {
        const result = await executeRequest({
            query: 'sp_guardarRemision',
            isStoredProcedure: true,
            inputs: [
                { name: 'idUsuario', type: sql.Int, value: idUsuario },
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idDepositoDestino', type: sql.Int, value: idDepositoDestino },
                { name: 'idPedidoInterno', type: sql.Int, value: idPedidoInterno },
                { name: 'observacion', type: sql.VarChar, value: observacion }
            ]
        });
        console.log(result);
        
        res.status(200).json({ message: 'Remisión guardada correctamente.', data: result.recordset });
    } catch (error: any) {
        console.error('Error al guardar remisión:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al guardar remisión', error: error.message || 'Error desconocido' });
    }
};

/**
 * ************************************************************
 * ****DESDE AQUI ES PARA RECIBIR MIS REMISIONES PENDIENTES****
 * ************************************************************
 */
export const consultaRemisionesEntrantes = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'sp_consultaRemisionesEntrantes',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: req.query.idTerminalWeb }
            ]
        })
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error('Error al consultar remisiones pendientes:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al consultar remisiones pendientes', error: error.message || 'Error desconocido' });
    }
}

export const consultaDetRemisionEntrante = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'sp_consultaDetRemisionesEntrantes',
            isStoredProcedure: true,
            inputs: [
                { name: 'idRemision', type: sql.Int, value: req.query.idRemision }
            ]
        })
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error('Error al consultar detalle de remisiones pendientes:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al consultar detalle de remisiones pendientes', error: error.message || 'Error desconocido' });
    }
}

export const recibirRemision = async (req: Request, res: Response) => {
    const {
        idRemision,
        idUsuarioReceptor
    }: IRecibirRemisionDTO = req.body;

    try {
        await executeRequest({
            query: 'sp_recibirRemision',
            isStoredProcedure: true,
            inputs: [
                { name: 'idRemision', type: sql.Int, value: idRemision },
                { name: 'idUsuarioReceptor', type: sql.Int, value: idUsuarioReceptor }
            ]
        });
        res.status(200).json({ message: 'Remisión recibida correctamente.' });
    } catch (error: any) {
        console.error('Error al recibir remisión:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al recibir remisión', error: error.message || 'Error desconocido' });
    }
};

export const eliminarDetRemisionTmp = async (req: Request, res: Response) => {
    const { idTerminalWeb, idDetRemisionTmp } = req.query;
    try {
        await executeRequest({
            query: 'sp_eliminarDetRemisionTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: Number(req.query.idTerminalWeb) },
                { name: 'idDetRemisionTmp', type: sql.Int, value: Number(req.query.idDetRemisionTmp) }
            ]
        });
        res.status(200).json({ message: 'Detalle de remisión eliminado correctamente.' });
    } catch (error: any) {
        console.error('Error al eliminar detalle de remisión:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al eliminar detalle de remisión', error: error.message || 'Error desconocido' });
    }
}

// PARA IMPORTAR EL DETALLE DEL PEDIDO INTERNO A UNA REMISION
export const importarPedidoInterno = async (req: Request, res: Response) => {
    const { idTerminalWeb, idPedidoInterno } = req.body;
    console.log(idTerminalWeb, idPedidoInterno);
    try {
        const result = await executeRequest({
            query: 'sp_importarPedidoARemisionTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idPedidoInterno', type: sql.Int, value: idPedidoInterno }
            ]
        })
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error('Error al importar pedido interno:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al importar pedido interno', error: error.message || 'Error desconocido' });
    }
}

// PARA LOS DEPOSITOS 
export const consultaDepositos = async (Req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'select * from v_deposito',
            isStoredProcedure: false
        })
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error('Error al consultar depositos:', error);
        if (error.number >= 50000) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al consultar depositos', error: error.message || 'Error desconocido' });
    }
}


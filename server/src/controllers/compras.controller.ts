import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';

// Interfaces
export interface IAgregarDetalleDTO {
    idTerminalWeb: number;
    idProveedor: number;
    idProducto: number;
    idDeposito: number;
    cantidad: number;
    bonificacion: number;
    costoTotal: number;
    porcentajeDescuento: number;
    notacredito: boolean;
    precio: number;
}

export interface IGuardarCompraDTO {
    idTerminalWeb: number;
    idSucursal: number;
    idPersonaJur: number;
    idProveedor: number;
    idTipoCompra: number;
    dsuc: string;
    dcaja: string;
    dfactu: string;
    timbrado: string;
    responsable: string;
    fecha: string;
    cotizacion: number;
    vence: string;
    total: number;
    habilitarCompra: boolean;
    idUsuarioAlta: number;
}

// Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
const formatDateToDDMMYYYY = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

// Controller Methods

export const agregarDetalleCompra = async (req: Request, res: Response) => {
    const {
        idTerminalWeb,
        idProveedor,
        idProducto,
        idDeposito,
        cantidad,
        bonificacion,
        costoTotal,
        porcentajeDescuento,
        notacredito,
        precio
    }: IAgregarDetalleDTO = req.body;

    try {
        await executeRequest({
            query: 'sp_agregarDetCompraTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idProveedor', type: sql.Int, value: idProveedor },
                { name: 'idProducto', type: sql.Int, value: idProducto },
                { name: 'idDeposito', type: sql.Int, value: idDeposito },
                { name: 'cantidad', type: sql.Numeric(18, 2), value: cantidad },
                { name: 'bonificacion', type: sql.Numeric(18, 2), value: bonificacion },
                { name: 'costoTotal', type: sql.Money, value: costoTotal },
                { name: 'porcentajeDescuento', type: sql.Numeric(18, 2), value: porcentajeDescuento },
                { name: 'notacredito', type: sql.Bit, value: notacredito },
                { name: 'precio', type: sql.Money, value: precio }
            ]
        });
        res.status(200).json({ message: 'Detalle de compra agregado correctamente.' });
    } catch (error: any) {
        console.error('Error al agregar detalle de compra:', error);
        // Manejo de errores específicos de SQL Server (50001, 50003)
        if (error.number === 50001 || error.number === 50003) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al agregar detalle de compra', error: error.message || 'Error desconocido' });
    }
};

export const consultarDetalleTemporal = async (req: Request, res: Response) => {
    const { idTerminalWeb } = req.query;

    try {
        const result = await executeRequest({
            query: 'sp_consultaDetCompraTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: Number(idTerminalWeb) }
            ]
        });
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error('Error al consultar detalle temporal:', error);
        res.status(500).json({ message: 'Error al consultar detalle temporal', error: error.message || 'Error desconocido' });
    }
};

export const eliminarItemTemporal = async (req: Request, res: Response) => {
    const { idTerminalWeb, idDetCompraTmp } = req.query; // Nota: idDetPedidoTmp se mantiene como nombre de param si el front lo manda así, pero el SP es el nuevo

    try {
        await executeRequest({
            query: 'sp_eliminarDetCompraTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: Number(idTerminalWeb) },
                { name: 'idDetCompraTmp', type: sql.Int, value: Number(idDetCompraTmp) }
            ]
        });
        res.status(200).json({ message: 'Item eliminado correctamente.' });
    } catch (error: any) {
        console.error('Error al eliminar item temporal:', error);
        res.status(500).json({ message: 'Error al eliminar item temporal', error: error.message || 'Error desconocido' });
    }
};

export const limpiarTemporal = async (req: Request, res: Response) => {
    const { idTerminalWeb } = req.query; // O body, dependiendo de cómo se llame. Usualmente DELETE usa query o params.

    try {
        await executeRequest({
            query: 'sp_limpiarDetCompraTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: Number(idTerminalWeb) }
            ]
        });
        res.status(200).json({ message: 'Temporal limpiado correctamente.' });
    } catch (error: any) {
        console.error('Error al limpiar temporal:', error);
        res.status(500).json({ message: 'Error al limpiar temporal', error: error.message || 'Error desconocido' });
    }
};

export const guardarCompra = async (req: Request, res: Response) => {
    const {
        idTerminalWeb,
        idSucursal,
        idPersonaJur,
        idProveedor,
        idTipoCompra,
        dsuc,
        dcaja,
        dfactu,
        timbrado,
        responsable,
        fecha,
        cotizacion,
        vence,
        total,
        habilitarCompra,
        idUsuarioAlta
    }: IGuardarCompraDTO = req.body;

    console.log("Estos son los datos de la compra: ", req.body);


    try {
        const result = await executeRequest({
            query: 'sp_guardarCompra',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idSucursal', type: sql.Int, value: idSucursal },
                { name: 'idPersonaJur', type: sql.Int, value: idPersonaJur },
                { name: 'idProveedor', type: sql.Int, value: idProveedor },
                { name: 'idTipoCompra', type: sql.Int, value: idTipoCompra },
                { name: 'dsuc', type: sql.VarChar(3), value: dsuc },
                { name: 'dcaja', type: sql.VarChar(3), value: dcaja },
                { name: 'dfactu', type: sql.VarChar(10), value: dfactu },
                { name: 'timbrado', type: sql.VarChar(20), value: timbrado },
                { name: 'responsable', type: sql.VarChar(40), value: responsable },
                { name: 'fecha', type: sql.VarChar(15), value: formatDateToDDMMYYYY(fecha) },
                { name: 'cotizacion', type: sql.Money, value: cotizacion },
                { name: 'vence', type: sql.VarChar(15), value: formatDateToDDMMYYYY(vence) },
                { name: 'total', type: sql.Money, value: total },
                { name: 'habilitarCompra', type: sql.Bit, value: habilitarCompra },
                { name: 'idUsuarioAlta', type: sql.Int, value: idUsuarioAlta }
            ]
        });

        // Si el SP retorna algo (ej: ID de la compra), se puede devolver.
        // Asumimos éxito si no hay error.
        res.status(200).json({ message: 'Compra guardada correctamente.', data: result.recordset });
    } catch (error: any) {
        console.error('Error al guardar compra:', error);
        // Capturar errores de lógica de negocio (RAISERROR)
        if (error.number >= 50000) { // Errores de usuario en SQL Server suelen ser > 50000
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al guardar compra', error: error.message || 'Error desconocido' });
    }
};

export const buscarProducto = async (req: Request, res: Response) => {
    const { busqueda } = req.query;

    try {
        const result = await executeRequest({
            query: 'sp_consultaProductoCompra',
            isStoredProcedure: true,
            inputs: [
                { name: 'busqueda', type: sql.VarChar(20), value: String(busqueda) }
            ]
        });
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error('Error al buscar producto:', error);
        res.status(500).json({ message: 'Error al buscar producto', error: error.message || 'Error desconocido' });
    }
};

export const buscarProveedor = async (req: Request, res: Response) => {
    const { busqueda } = req.query;

    try {
        const result = await executeRequest({
            query: 'select * from funProveedoresActivos (2)',
            isStoredProcedure: false,
        });
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error('Error al buscar proveedores:', error);
        res.status(500).json({ message: 'Error al buscar los proveedores', error: error.message || 'Error desconocido' });
    }
};

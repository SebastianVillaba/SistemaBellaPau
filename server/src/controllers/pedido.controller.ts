import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';

export const agregarDetPedidoTmp = async (req: Request, res: Response) => {
    const { idTerminalWeb, idProducto, idStock, cantidad, precio } = req.body;

    try {
        await executeRequest({
            query: 'sp_agregarDetPedidoTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idProducto', type: sql.Int, value: idProducto },
                { name: 'idStock', type: sql.Int, value: idStock },
                { name: 'cantidad', type: sql.Numeric(10, 4), value: cantidad },
                { name: 'precio', type: sql.Money, value: precio }
            ]
        });
        res.status(200).json({ message: 'Detalle de pedido agregado correctamente.' });
    } catch (error) {
        console.error('Error al agregar detalle de pedido temporal:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al agregar detalle de pedido temporal', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al agregar detalle de pedido temporal', error: 'An unknown error occurred' });
        }
    }
};

export const consultarDetallePedido = async (req: Request, res: Response) => {
    const { idTerminalWeb } = req.query;

    try {
        const result = await executeRequest({
            query: 'sp_consultaDetPedidoTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: Number(idTerminalWeb) }
            ]
        });
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al consultar el detalle del pedido:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al consultar el detalle del pedido', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al consultar el detalle del pedido', error: 'An unknown error occurred' });
        }
    }
};

export const eliminarDetallePedido = async (req: Request, res: Response) => {
    const { idTerminalWeb, idDetPedidoTmp } = req.query;

    try {
        await executeRequest({
            query: 'sp_eliminarDetPedidoTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: Number(idTerminalWeb) },
                { name: 'idDetPedidoTmp', type: sql.Int, value: Number(idDetPedidoTmp) }
            ]
        });
        res.status(200).json({ message: 'Detalle de pedido eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar detalle de pedido temporal:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al eliminar detalle de pedido temporal', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al eliminar detalle de pedido temporal', error: 'An unknown error occurred' });
        }
    }
};

export const guardarPedidoFinal = async (req: Request, res: Response) => {
    const { idUsuarioAlta, idTerminalWeb, idPedidoExistente, idTipoCobro, idCliente, idDelivery, direccion, fechaEntrega, observacion } = req.body;

    try {
        const result = await executeRequest({
            query: 'sp_guardarPedidoFinal',
            isStoredProcedure: true,
            inputs: [
                { name: 'idUsuarioAlta', type: sql.Int, value: idUsuarioAlta },
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idPedidoExistente', type: sql.Int, value: idPedidoExistente },
                { name: 'idTipoCobro', type: sql.Int, value: idTipoCobro },
                { name: 'idCliente', type: sql.Int, value: idCliente },
                { name: 'idDelivery', type: sql.Int, value: idDelivery },
                { name: 'direccion', type: sql.VarChar(60), value: direccion },
                { name: 'fechaEntrega', type: sql.Date, value: fechaEntrega },
                { name: 'observacion', type: sql.VarChar(255), value: observacion }
            ]
        });
        res.status(200).json({ message: 'Pedido guardado correctamente.', idPedido: result.recordset[0].idPedido });
    } catch (error) {
        console.error('Error al guardar el pedido final:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al guardar el pedido final', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al guardar el pedido final', error: 'An unknown error occurred' });
        }
    }
};

export const consultaPedidosDia = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'sp_consultaListadoPedidosDia',
            isStoredProcedure: true,
        });
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al consultar los pedidos del día:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al consultar los pedidos del día', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al consultar los pedidos del día', error: 'An unknown error occurred' });
        }
    }
};

export const consultaTipoCobro = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'select idTipoCobro,nombreTipo from v_tipoCobro',
            isStoredProcedure: false
        });
        res.status(200).json(result.recordset);
    } catch (error: any) {
        console.error('Error al consultar los tipos de cobro:', error);
        res.status(500).json({ message: 'Error al consultar los tipos de cobro', error: error.message });
    }
}

export const obtenerDatosPedido = async (req: Request, res: Response) => {
    const { idPedido } = req.params;
    const { idTerminalWeb } = req.query;

    try {
        const result = await executeRequest({
            query: 'sp_obtenerDatosPedido',
            isStoredProcedure: true,
            inputs: [
                { name: 'idPedido', type: sql.Int, value: Number(idPedido) },
                { name: 'idTerminalWeb', type: sql.Int, value: Number(idTerminalWeb) }
            ]
        });
        res.status(200).json(result.recordset[0] || null);
    } catch (error) {
        console.error('Error al obtener datos del pedido:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al obtener datos del pedido', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al obtener datos del pedido', error: 'An unknown error occurred' });
        }
    }
};

export const facturarPedidosPendientesCliente = async (req: Request, res: Response) => {
    const { idCliente, idTerminalWeb } = req.body;

    try {
        const result = await executeRequest({
            query: 'sp_facturarPedidosPendientesCliente',
            isStoredProcedure: true,
            inputs: [
                { name: 'idCliente', type: sql.Int, value: idCliente },
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb }
            ]
        });
        res.status(200).json(result.recordset[0] || null);
    } catch (error) {
        console.error('Error al facturar pedidos pendientes del cliente:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al facturar pedidos pendientes del cliente', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al facturar pedidos pendientes del cliente', error: 'An unknown error occurred' });
        }
    }
};

export const pedidoClienteFacturacion = async (req: Request, res: Response) => {
    const { idPedido, idTerminalWeb } = req.body;

    try {
        const result = await executeRequest({
            query: 'sp_pedidoClienteFacturacion',
            isStoredProcedure: true,
            inputs: [
                { name: 'idPedido', type: sql.Int, value: idPedido },
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb }
            ]
        });
        res.status(200).json(result.recordset[0] || null);
    } catch (error) {
        console.error('Error al enviar pedido a facturación:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al enviar pedido a facturación', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al enviar pedido a facturación', error: 'An unknown error occurred' });
        }
    }
};

export const pedidosClienteMasivoAFacturacion = async (req: Request, res: Response) => {
    const { idTerminalWeb } = req.body;

    try {
        const result = await executeRequest({
            query: 'sp_pedidosClienteMasivoAFacturacion',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb }
            ]
        });
        res.status(200).json(result.recordset[0] || null);
    } catch (error) {
        console.error('Error al procesar facturación masiva de pedidos:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al procesar facturación masiva de pedidos', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al procesar facturación masiva de pedidos', error: 'An unknown error occurred' });
        }
    }
};

export const agregarDetPedidoFacturacionTmp = async (req: Request, res: Response) => {
    const { idTerminalWeb, idPedido } = req.body;

    try {
        await executeRequest({
            query: 'sp_agregarDetPedidoFacturacionTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idPedido', type: sql.Int, value: idPedido }
            ]
        });
        res.status(200).json({ message: 'Pedido agregado a la selección de facturación.' });
    } catch (error) {
        console.error('Error al agregar pedido a facturación temporal:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al agregar pedido a facturación temporal', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al agregar pedido a facturación temporal', error: 'An unknown error occurred' });
        }
    }
};

export const eliminarDetPedidoFacturacionTmp = async (req: Request, res: Response) => {
    const { idTerminalWeb, idDetPedidoFacturacionTmp } = req.query;

    try {
        await executeRequest({
            query: 'sp_eliminarDetPedidoFacturacionTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: Number(idTerminalWeb) },
                { name: 'idDetPedidoFacturacionTmp', type: sql.Int, value: Number(idDetPedidoFacturacionTmp) }
            ]
        });
        res.status(200).json({ message: 'Pedido eliminado de la selección de facturación.' });
    } catch (error) {
        console.error('Error al eliminar pedido de facturación temporal:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al eliminar pedido de facturación temporal', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al eliminar pedido de facturación temporal', error: 'An unknown error occurred' });
        }
    }
};

export const consultaPedidoFecha = async (req: Request, res: Response) => {
    const { fecha } = req.query;

    try {
        const result = await executeRequest({
            query: 'sp_consultaPedidoFecha',
            isStoredProcedure: true,
            inputs: [
                { name: 'fecha', type: sql.Date, value: fecha }
            ]
        });
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al consultar pedidos por fecha:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al consultar pedidos por fecha', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al consultar pedidos por fecha', error: 'An unknown error occurred' });
        }
    }
};

export const consultaPedidoFiltro = async (req: Request, res: Response) => {
    const { nombre, idTipoCobro, habilitarEstado, estadoCobro } = req.query;

    try {
        const result = await executeRequest({
            query: 'sp_consultaPedidoFiltro',
            isStoredProcedure: true,
            inputs: [
                { name: 'nombre', type: sql.VarChar(100), value: nombre ?? '' },
                { name: 'idTipoCobro', type: sql.Int, value: Number(idTipoCobro) },
                { name: 'habilitarEstado', type: sql.Bit, value: habilitarEstado === 'true' ? 1 : 0 },
                { name: 'estadoCobro', type: sql.Bit, value: habilitarEstado === 'true' ? (estadoCobro === 'true' ? 1 : 0) : null }
            ]
        });
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al consultar pedidos con filtro:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al consultar pedidos con filtro', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al consultar pedidos con filtro', error: 'An unknown error occurred' });
        }
    }
};

export const limpiarDetPedidoTmp = async (req: Request, res: Response) => {
    try {
        const { idTerminalWeb } = req.query;
        await executeRequest({
            query: `delete from detPedidoTmp where idTerminalWeb=${idTerminalWeb}`,
            isStoredProcedure: false
        });
        res.status(200).json({ message: 'Detalles del pedido eliminados correctamente.' });
    } catch (error) {
        console.error('Error al eliminar detalles del pedido:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al eliminar detalles del pedido', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al eliminar detalles del pedido', error: 'An unknown error occurred' });
        }
    }
}

export const anularPedido = async (req: Request, res: Response) => {
    try {
        const { idPedido } = req.params;
        await executeRequest({
            query: `update pedido set activo=0 where idPedido=${idPedido}`,
            isStoredProcedure: false
        });
        res.status(200).json({ message: 'Pedido anulado correctamente.' });
    } catch (error) {
        console.error('Error al anular el pedido:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Error al anular el pedido', error: error.message });
        } else {
            res.status(500).json({ message: 'Error al anular el pedido', error: 'Un error desconocido ha ocurrido.' });
        }
    }
}
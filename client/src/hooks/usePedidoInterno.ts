import { useState, useCallback, useEffect } from 'react';
import { pedidoInternoService } from '../services/pedidoInterno.service';
import { useTerminal } from './useTerminal';

export const usePedidoInterno = () => {
    const { idTerminalWeb } = useTerminal();
    const [items, setItems] = useState<any[]>([]);
    const [sucursales, setSucursales] = useState<any[]>([]);
    const [idSucursalProveedor, setIdSucursalProveedor] = useState<number>(0);
    const [observacion, setObservacion] = useState('');
    const [fechaNecesaria, setFechaNecesaria] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const cargarDetalles = useCallback(async () => {
        if (!idTerminalWeb) return;
        try {
            const data = await pedidoInternoService.consultarDetalleTmp(idTerminalWeb);
            setItems(data);
        } catch (err: any) {
            console.error(err);
            setError('Error al cargar detalles');
        }
    }, [idTerminalWeb]);

    const cargarSucursales = useCallback(async () => {
        try {
            const data = await pedidoInternoService.consultaSucursales();
            setSucursales(data);
        } catch (err: any) {
            console.error(err);
            setError('Error al cargar sucursales');
        }
    }, []);

    useEffect(() => {
        if (idTerminalWeb) {
            cargarDetalles();
        }
        cargarSucursales();
    }, [idTerminalWeb, cargarDetalles, cargarSucursales]);

    const agregarDetalle = async (producto: any, cantidad: number) => {
        if (!idTerminalWeb) return;
        try {
            await pedidoInternoService.agregarDetalle({
                idTerminalWeb,
                idProducto: producto.idProducto,
                cantidadSolicitada: cantidad
            });
            await cargarDetalles();
            setSuccess('Producto agregado correctamente');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(''), 3000);
        }
    };

    const eliminarDetalle = async (idDetPedidoInternoTmp: number) => {
        if (!idTerminalWeb) return;
        try {
            await pedidoInternoService.eliminarDetalle(idTerminalWeb, idDetPedidoInternoTmp);
            await cargarDetalles();
            setSuccess('Producto eliminado correctamente');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(''), 3000);
        }
    };

    const guardarPedido = async () => {
        if (!idTerminalWeb) return;
        if (items.length === 0) {
            setError('Debe agregar al menos un producto');
            return;
        }
        if (!idSucursalProveedor) {
            setError('Debe seleccionar una sucursal destino');
            return;
        }

        try {
            await pedidoInternoService.guardarPedido({
                idUsuario: 1, // TODO: Obtener usuario real del contexto
                idTerminalWeb,
                idSucursalProveedor,
                fechaNecesaria,
                observacion
            });
            setSuccess('Pedido interno guardado correctamente');
            setItems([]);
            setObservacion('');
            setIdSucursalProveedor(0);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Error al guardar pedido');
            setTimeout(() => setError(''), 3000);
        }
    };

    return {
        items,
        sucursales,
        idSucursalProveedor,
        setIdSucursalProveedor,
        observacion,
        setObservacion,
        fechaNecesaria,
        setFechaNecesaria,
        error,
        setError,
        success,
        setSuccess,
        agregarDetalle,
        eliminarDetalle,
        guardarPedido,
        cargarDetalles
    };
};

import { useState, useEffect, useCallback } from 'react';
import { remisionService } from '../services/remision.service';
import { useTerminal } from './useTerminal';
import { Login } from '@mui/icons-material';

export const useRemisiones = () => {
    const { idTerminalWeb } = useTerminal();
    const [items, setItems] = useState<any[]>([]);
    const [observacion, setObservacion] = useState('');
    const [idDepositoDestino, setIdDepositoDestino] = useState<number>(0);
    const [depositos, setDepositos] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // TODO: Obtener idUsuario del contexto
    const idUsuario = 1;

    const [idPedidoInterno, setIdPedidoInterno] = useState<number | null>(null);

    const consultarStock = useCallback(async (busqueda: string) => {
        if (!idTerminalWeb) return [];
        try {
            return await remisionService.consultarStock(busqueda, idTerminalWeb);
        } catch (err: any) {
            setError(err.message);
            return [];
        }
    }, [idTerminalWeb]);

    const consultarDetalleRemisionTmp = useCallback(async () => {
        if (!idTerminalWeb) return [];
        try {
            return await remisionService.consultarDetalleRemisionTmp(idTerminalWeb);
        } catch (err: any) {
            setError(err.message);
            return [];
        }
    }, [idTerminalWeb]);

    const cargarDetalles = useCallback(async () => {
        const data = await consultarDetalleRemisionTmp();
        setItems(data);
    }, [consultarDetalleRemisionTmp]);

    const cargarDepositos = useCallback(async () => {
        try {
            const result = await remisionService.consultaDeposito();
            setDepositos(result);
        } catch (err: any) {
            console.error('Error al cargar depósitos', err);
        }
    }, []);

    // Cargar depósitos y detalle temporal al montar o cambiar terminal
    useEffect(() => {
        if (idTerminalWeb) {
            cargarDepositos();
            cargarDetalles();
        }
    }, [idTerminalWeb, cargarDepositos, cargarDetalles]);

    const agregarDetalle = async (producto: any, cantidad: number) => {
        if (!idTerminalWeb) {
            setError('Terminal no configurada');
            return;
        }
        setLoading(true);
        try {
            await remisionService.agregarDetalleRemision({
                idTerminalWeb,
                idProducto: producto.idProducto,
                idStock: producto.idStock,
                cantidadEnviada: cantidad
            });

            await cargarDetalles();
            setSuccess('Producto agregado correctamente');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const eliminarDetalleRemisionTmp = async (idDetRemisionTmp: number) => {
        if (!idTerminalWeb) {
            setError('Terminal no configurada');
            return;
        }
        setLoading(true);
        try {
            await remisionService.eliminarDetalleRemisionTmp(idTerminalWeb, idDetRemisionTmp);
            await cargarDetalles();
            setSuccess('Detalle remisión temporal eliminado exitosamente');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const guardarRemision = async () => {
        if (!idTerminalWeb) {
            setError('Terminal no configurada');
            return null;
        }
        if (items.length === 0) {
            setError('No hay items en la remisión');
            return null;
        }
        if (!idDepositoDestino) {
            setError('Seleccione un depósito destino');
            return null;
        }

        setLoading(true);
        try {
            const response = await remisionService.guardarRemision({
                idUsuario,
                idTerminalWeb,
                idDepositoDestino,
                idPedidoInterno,
                observacion
            });
            setSuccess('Remisión guardada exitosamente');
            setItems([]);
            setObservacion('');
            setIdDepositoDestino(0);
            setIdPedidoInterno(null);

            // Asumiendo que el SP devuelve el ID en el primer recordset
            console.log(response);
            
            return response.data?.[0]?.idRemision;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'F2') {
                event.preventDefault();
                guardarRemision();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [items, idDepositoDestino, observacion, idPedidoInterno]);

    return {
        items,
        observacion,
        setObservacion,
        idDepositoDestino,
        setIdDepositoDestino,
        depositos,
        error,
        setError,
        success,
        setSuccess,
        loading,
        consultarStock,
        agregarDetalle,
        guardarRemision,
        consultarDetalleRemisionTmp,
        eliminarDetalleRemisionTmp,
        idPedidoInterno,
        setIdPedidoInterno,
        cargarDetalles
    };
};

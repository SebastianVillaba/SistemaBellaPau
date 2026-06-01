import { useState, useCallback, useEffect } from 'react';
import { stockInicialService } from '../services/stockInicial.service';
import type { IDetalleStockInicial } from '../services/stockInicial.service';
import { useTerminal } from './useTerminal';
import { remisionService } from '../services/remision.service';

export const useStockInicial = () => {
    const { idTerminalWeb } = useTerminal();

    // Data
    const [items, setItems] = useState<IDetalleStockInicial[]>([]);
    const [depositos, setDepositos] = useState<any[]>([]);
    const [idDeposito, setIdDeposito] = useState<number>(0);

    // UI
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const cargarDetalles = useCallback(async () => {
        if (!idTerminalWeb) return;
        try {
            const data = await stockInicialService.consultarDetalle(idTerminalWeb);
            setItems(data);
        } catch (err: any) {
            setError('Error al cargar items');
        }
    }, [idTerminalWeb]);

    const cargarDepositos = useCallback(async () => {
        if (!idTerminalWeb) return;
        try {
            const data = await remisionService.consultaDeposito();
            setDepositos(data || []);
            // Seleccionar el primer depósito por defecto si existe
            if (data && data.length > 0) {
                // TODO: Idealmente seleccionar el que corresponde a la terminal
                setIdDeposito(data[0].idDeposito);
            }
        } catch (err: any) {
            setError('Error al cargar depósitos');
        }
    }, [idTerminalWeb]);

    useEffect(() => {
        cargarDetalles();
        cargarDepositos();
    }, [cargarDetalles, cargarDepositos]);

    const agregarDetalle = async (producto: any, cantidad: number, costo: number) => {
        setLoading(true);
        setError('');
        try {
            await stockInicialService.agregarDetalle({
                idTerminalWeb: idTerminalWeb!,
                idProducto: producto.idProducto,
                cantidad,
                costo
            });
            await cargarDetalles();
            setSuccess('Producto agregado correctamente');
            return true;
        } catch (err: any) {
            // El backend retorna mensajes de negocio (RAISERROR)
            setError(err.response?.data?.message || err.message || 'Error al agregar producto');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const eliminarDetalle = async (idDetStockInicialTmp: number) => {
        setLoading(true);
        try {
            await stockInicialService.eliminarDetalle(idTerminalWeb!, idDetStockInicialTmp);
            await cargarDetalles();
            setSuccess('Producto eliminado correctamente');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al eliminar producto');
        } finally {
            setLoading(false);
        }
    };

    const guardarStockInicial = async (idUsuario: number) => {
        if (items.length === 0) {
            setError('No hay items para guardar');
            return;
        }
        setLoading(true);
        try {
            await stockInicialService.guardarStockInicial({
                idUsuario,
                idTerminalWeb: idTerminalWeb!,
                idDeposito
            });
            setSuccess('Stock Inicial guardado exitosamente');
            setItems([]); // Limpiar grilla
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al guardar Stock Inicial');
        } finally {
            setLoading(false);
        }
    };

    return {
        items,
        depositos,
        idDeposito,
        setIdDeposito,
        error,
        setError,
        success,
        setSuccess,
        loading,
        agregarDetalle,
        eliminarDetalle,
        guardarStockInicial
    };
};

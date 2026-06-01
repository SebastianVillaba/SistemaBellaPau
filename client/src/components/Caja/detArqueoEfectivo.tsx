import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    CircularProgress,
} from '@mui/material';
import TextField from '../UppercaseTextField';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DenominacionSelectorModal from './DenominacionSelectorModal';
import { cajaService } from '../../services/caja.service';
import type { ArqueoCajaTmpItem } from '../../types/caja.types';
import type { Denominacion } from '../../services/denominacion.service';

interface DetArqueoEfectivoProps {
    idTerminalWeb: number;
    onTotalChange?: (total: number) => void;
}

interface ArqueoLocal extends ArqueoCajaTmpItem {
    isNew?: boolean;
    isEditing?: boolean;
}

const DetArqueoEfectivo: React.FC<DetArqueoEfectivoProps> = ({
    idTerminalWeb,
    onTotalChange,
}) => {
    const [items, setItems] = useState<ArqueoLocal[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [newItemIndex, setNewItemIndex] = useState<number | null>(null);

    // Refs para navegación de teclado
    const addButtonRef = useRef<HTMLButtonElement>(null);
    const cantidadInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    // Cargar arqueo al montar
    useEffect(() => {
        if (idTerminalWeb) {
            cargarArqueo();
        }
    }, [idTerminalWeb]);

    // Notificar cambio de total
    useEffect(() => {
        const total = items.reduce((sum, item) => sum + item.subtotal, 0);
        onTotalChange?.(total);
    }, [items, onTotalChange]);

    // Enfocar el campo de cantidad del nuevo item
    useEffect(() => {
        if (newItemIndex !== null && items.length > 0) {
            const lastItem = items[items.length - 1];
            setTimeout(() => {
                const inputRef = cantidadInputRefs.current[lastItem.idArqueoTmp];
                if (inputRef) {
                    inputRef.focus();
                    inputRef.select();
                }
                setNewItemIndex(null);
            }, 100);
        }
    }, [newItemIndex, items]);

    const cargarArqueo = async () => {
        setLoading(true);
        try {
            const response = await cajaService.listarArqueoCajaTmp(idTerminalWeb);
            if (response.success) {
                const sortedItems = response.result.sort((a, b) => a.idArqueoTmp - b.idArqueoTmp);
                setItems(sortedItems.map(item => ({ ...item, isNew: false, isEditing: false })));
            }
        } catch (error) {
            console.error('Error al cargar arqueo:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDenominacion = async (denominacion: Denominacion) => {
        setSaving(true);
        try {
            await cajaService.agregarArqueoCajaTmp(idTerminalWeb, denominacion.idDenominacion, 1);
            await cargarArqueo();
            // Marcar que hay un nuevo item para enfocar
            setNewItemIndex(items.length);
        } catch (error: any) {
            console.error('Error al agregar denominación:', error);
            alert(error.response?.data?.message || 'Error al agregar denominación');
        } finally {
            setSaving(false);
        }
    };

    const handleCantidadChange = async (index: number, nuevaCantidad: number) => {
        if (nuevaCantidad < 0) return;

        const item = items[index];
        const newItems = [...items];
        newItems[index] = {
            ...item,
            cantidad: nuevaCantidad,
            subtotal: item.valor * nuevaCantidad,
        };
        setItems(newItems);

        // Actualizar en backend
        try {
            await cajaService.agregarArqueoCajaTmp(idTerminalWeb, item.idDenominacion, nuevaCantidad);
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            await cargarArqueo();
        }
    };

    const handleCantidadKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Volver al botón de agregar denominación
            addButtonRef.current?.focus();
        }
    };

    const handleEliminar = async (index: number) => {
        const item = items[index];
        setSaving(true);
        try {
            await cajaService.eliminarArqueoCajaTmp(idTerminalWeb, item.idArqueoTmp);
            await cargarArqueo();
        } catch (error: any) {
            console.error('Error al eliminar:', error);
            alert(error.response?.data?.message || 'Error al eliminar');
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PY', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const totalArqueo = items.reduce((sum, item) => sum + item.subtotal, 0);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Botón para agregar denominación */}
            <Button
                ref={addButtonRef}
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenModal(true)}
                disabled={saving}
                sx={{ mb: 2 }}
            >
                Agregar Denominación
            </Button>

            {/* Tabla/Grid interactivo */}
            <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>
                                Denominación
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', width: 120 }}>
                                Cantidad
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>
                                Subtotal
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', width: 60 }}>

                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={item.idArqueoTmp} hover>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                        {item.nombreBillete}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Gs. {formatCurrency(item.valor)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={item.cantidad}
                                        onChange={(e) => handleCantidadChange(index, parseInt(e.target.value) || 0)}
                                        onKeyDown={(e) => handleCantidadKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index)}
                                        inputRef={(el) => {
                                            cantidadInputRefs.current[item.idArqueoTmp] = el;
                                        }}
                                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                        sx={{ width: 80 }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body1" fontWeight="bold" color="success.main">
                                        Gs. {formatCurrency(item.subtotal)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleEliminar(index)}
                                        disabled={saving}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No hay denominaciones agregadas. Click en "Agregar Denominación" para comenzar.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Total */}
            <Paper sx={{ p: 2, mt: 2, backgroundColor: '#e8f5e9' }}>
                <Typography variant="h5" align="right" fontWeight="bold">
                    TOTAL: Gs. {formatCurrency(totalArqueo)}
                </Typography>
            </Paper>

            {/* Modal selector de denominaciones */}
            <DenominacionSelectorModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSelect={handleSelectDenominacion}
            />
        </Box>
    );
};

export default DetArqueoEfectivo;

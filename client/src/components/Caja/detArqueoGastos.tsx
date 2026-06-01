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
    InputAdornment,
} from '@mui/material';
import TextField from '../UppercaseTextField';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { cajaService } from '../../services/caja.service';
import type { GastoCajaTmpItem } from '../../types/caja.types';

interface DetArqueoGastosProps {
    idTerminalWeb: number;
    idMovimientoCaja: number | null;
    onTotalChange?: (total: number) => void;
    disabled?: boolean;
}

interface GastoLocal extends GastoCajaTmpItem {
    isNew?: boolean;
    isEditing?: boolean;
}

interface EditingGasto {
    idGastoCajaTmp: number;
    concepto: string;
    montoGasto: string;
}

// cajaAbierta
//                                             ? 'rgba(251, 209, 209, 1)'
//                                             : 'rgba(180, 180, 180, 0.4)'

const DetArqueoGastos: React.FC<DetArqueoGastosProps> = ({
    idTerminalWeb,
    idMovimientoCaja,
    onTotalChange,
    disabled = false,
}) => {
    const [gastos, setGastos] = useState<GastoLocal[]>([]);
    const [saving, setSaving] = useState(false);
    const [totalGastos, setTotalGastos] = useState(0);

    // Estado para nueva fila
    const [nuevaFila, setNuevaFila] = useState<{ concepto: string; montoGasto: string } | null>(null);
    const [shouldFocusMonto, setShouldFocusMonto] = useState(false);

    // Estado para edición
    const [editingGasto, setEditingGasto] = useState<EditingGasto | null>(null);

    // Refs para navegación de teclado
    const addButtonRef = useRef<HTMLButtonElement>(null);
    const montoInputRef = useRef<HTMLInputElement>(null);
    const conceptoInputRef = useRef<HTMLInputElement>(null);
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const editMontoInputRef = useRef<HTMLInputElement>(null);
    const editConceptoInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        handleListarGastosTmp();
    }, []);

    // Notificar cambio de total
    useEffect(() => {
        const total = gastos.reduce((acc, gasto) => acc + gasto.montoGasto, 0);
        onTotalChange?.(total);
    }, [gastos, onTotalChange]);

    // Enfocar el campo de monto solo cuando se crea una nueva fila
    useEffect(() => {
        if (shouldFocusMonto) {
            setTimeout(() => {
                montoInputRef.current?.focus();
            }, 100);
            setShouldFocusMonto(false);
        }
    }, [shouldFocusMonto]);

    // Enfocar el campo de monto cuando se está editando
    useEffect(() => {
        if (editingGasto) {
            setTimeout(() => {
                editMontoInputRef.current?.focus();
                editMontoInputRef.current?.select();
            }, 100);
        }
    }, [editingGasto?.idGastoCajaTmp]);

    const handleAgregarFila = () => {
        if (!idMovimientoCaja) {
            alert('Debe abrir una caja primero para agregar gastos');
            return;
        }
        // Cancelar edición si hay una activa
        setEditingGasto(null);
        setNuevaFila({ concepto: '', montoGasto: '' });
        setShouldFocusMonto(true);
    };

    const handleGuardarNuevaFila = async () => {
        if (!nuevaFila || !idMovimientoCaja) return;

        const montoNumerico = parseFloat(nuevaFila.montoGasto);
        if (!nuevaFila.concepto.trim()) {
            alert('El concepto es obligatorio');
            conceptoInputRef.current?.focus();
            return;
        }
        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            alert('El monto debe ser mayor a 0');
            montoInputRef.current?.focus();
            return;
        }

        setSaving(true);
        try {
            await cajaService.agregarGastoCaja(
                idTerminalWeb,
                idMovimientoCaja,
                nuevaFila.concepto.trim(),
                montoNumerico
            );

            // Recargar lista desde el servidor
            await handleListarGastosTmp();
            setNuevaFila(null);

            // Volver al botón de agregar gasto para crear un ciclo
            setTimeout(() => {
                addButtonRef.current?.focus();
            }, 100);
        } catch (error: any) {
            console.error('Error al agregar gasto:', error);
            alert(error.response?.data?.message || 'Error al agregar gasto');
        } finally {
            setSaving(false);
        }
    };

    const handleEditar = (gasto: GastoLocal) => {
        // Cancelar nueva fila si hay una activa
        setNuevaFila(null);
        setEditingGasto({
            idGastoCajaTmp: gasto.idGastoCajaTmp,
            concepto: gasto.concepto,
            montoGasto: gasto.montoGasto.toString(),
        });
    };

    const handleGuardarEdicion = async () => {
        if (!editingGasto || !idMovimientoCaja) return;

        const montoNumerico = parseFloat(editingGasto.montoGasto);
        if (!editingGasto.concepto.trim()) {
            alert('El concepto es obligatorio');
            editConceptoInputRef.current?.focus();
            return;
        }
        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            alert('El monto debe ser mayor a 0');
            editMontoInputRef.current?.focus();
            return;
        }

        setSaving(true);
        try {
            // Usar el mismo endpoint pero con idGastoCajaTmp para editar
            await cajaService.agregarGastoCaja(
                idTerminalWeb,
                idMovimientoCaja,
                editingGasto.concepto.trim(),
                montoNumerico,
                editingGasto.idGastoCajaTmp // Pasar el ID para editar
            );

            // Recargar lista desde el servidor
            await handleListarGastosTmp();
            setEditingGasto(null);

            // Volver al botón de agregar
            setTimeout(() => {
                addButtonRef.current?.focus();
            }, 100);
        } catch (error: any) {
            console.error('Error al editar gasto:', error);
            alert(error.response?.data?.message || 'Error al editar gasto');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelarEdicion = () => {
        setEditingGasto(null);
    };

    const handleEditMontoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            editConceptoInputRef.current?.focus();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelarEdicion();
        }
    };

    const handleEditConceptoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleGuardarEdicion();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelarEdicion();
        }
    };

    const handleMontoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            conceptoInputRef.current?.focus();
        }
    };

    const handleConceptoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleGuardarNuevaFila();
        }
    };

    const handleCancelarNuevaFila = () => {
        setNuevaFila(null);
        setTimeout(() => {
            addButtonRef.current?.focus();
        }, 100);
    };

    const handleEliminar = async (index: number) => {
        const gasto = gastos[index];
        setSaving(true);
        try {
            await cajaService.eliminarGastoCajaTmp(gasto.idGastoCajaTmp, idTerminalWeb);
            await handleListarGastosTmp();
        } catch (error: any) {
            console.error('Error al eliminar gasto:', error);
            alert(error.response?.data?.message || 'Error al eliminar gasto');
        } finally {
            setSaving(false);
        }
    };

    const handleListarGastosTmp = async () => {
        try {
            const response = await cajaService.listarGastoCajaTmp(idTerminalWeb);

            console.log(response);


            if (response.success) {
                setGastos(response.detalle);
                setTotalGastos(response.totalGasto[0].totalGasto);
            }
        } catch (error: any) {
            console.error('Error al listar gastos:', error);
            // No mostrar alert aquí para evitar spam en errores de carga inicial
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PY', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <Box sx={{
            position: 'relative',
            ...(disabled && {
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(180, 180, 180, 0.4)',
                    borderRadius: 1,
                    zIndex: 1,
                    pointerEvents: 'none',
                }
            })
        }}>
            {/* Botón para agregar gasto */}
            <Button
                ref={addButtonRef}
                variant="contained"
                color="error"
                startIcon={<AddIcon />}
                onClick={handleAgregarFila}
                disabled={saving || nuevaFila !== null || !idMovimientoCaja || disabled}
                sx={{ mb: 2 }}
            >
                Agregar Gasto
            </Button>

            {!idMovimientoCaja && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Debe abrir una caja para poder agregar gastos
                </Typography>
            )}

            {/* Tabla de gastos */}
            <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#ffebee', width: 60 }}>
                                Nro
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#ffebee', width: 150 }}>
                                Monto
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#ffebee' }}>
                                Concepto
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#ffebee', width: 100 }}>

                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {gastos.map((gasto, index) => {
                            const isEditing = editingGasto?.idGastoCajaTmp === gasto.idGastoCajaTmp;

                            if (isEditing) {
                                // Fila en modo edición
                                return (
                                    <TableRow key={gasto.idGastoCajaTmp} sx={{ backgroundColor: '#e3f2fd' }}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {index + 1}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="text"
                                                value={editingGasto.montoGasto}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                        setEditingGasto({ ...editingGasto, montoGasto: value });
                                                    }
                                                }}
                                                onKeyDown={handleEditMontoKeyDown}
                                                inputRef={editMontoInputRef}
                                                placeholder="0"
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">Gs.</InputAdornment>,
                                                }}
                                                sx={{ width: '100%' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={editingGasto.concepto}
                                                onChange={(e) => setEditingGasto({ ...editingGasto, concepto: e.target.value })}
                                                onKeyDown={handleEditConceptoKeyDown}
                                                inputRef={editConceptoInputRef}
                                                placeholder="Concepto del gasto..."
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={handleGuardarEdicion}
                                                    disabled={saving}
                                                >
                                                    <SaveIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="default"
                                                    onClick={handleCancelarEdicion}
                                                    disabled={saving}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            }

                            // Fila normal (no edición)
                            return (
                                <TableRow key={gasto.idGastoCajaTmp} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {index + 1}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body1" fontWeight="bold" color="error.main">
                                            Gs. {formatCurrency(gasto.montoGasto)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {gasto.concepto}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleEditar(gasto)}
                                                disabled={saving || nuevaFila !== null || editingGasto !== null}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleEliminar(index)}
                                                disabled={saving}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {/* Fila para agregar nuevo gasto */}
                        {nuevaFila && (
                            <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                        {gastos.length + 1}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        type="text"
                                        value={nuevaFila.montoGasto}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                setNuevaFila({ ...nuevaFila, montoGasto: value });
                                            }
                                        }}
                                        onKeyDown={handleMontoKeyDown}
                                        inputRef={montoInputRef}
                                        placeholder="0"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">Gs.</InputAdornment>,
                                        }}
                                        sx={{ width: '100%' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        value={nuevaFila.concepto}
                                        onChange={(e) => setNuevaFila({ ...nuevaFila, concepto: e.target.value })}
                                        onKeyDown={handleConceptoKeyDown}
                                        inputRef={conceptoInputRef}
                                        placeholder="Concepto del gasto..."
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton
                                            ref={saveButtonRef}
                                            size="small"
                                            color="success"
                                            onClick={handleGuardarNuevaFila}
                                            disabled={saving}
                                        >
                                            <SaveIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="default"
                                            onClick={handleCancelarNuevaFila}
                                            disabled={saving}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}

                        {gastos.length === 0 && !nuevaFila && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        No hay gastos registrados. Click en "Agregar Gasto" para comenzar.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Total */}
            <Paper sx={{ p: 2, mt: 2, backgroundColor: '#ffebee' }}>
                <Typography variant="h5" align="right" fontWeight="bold" color="error.main">
                    TOTAL GASTOS: Gs. {formatCurrency(totalGastos)}
                </Typography>
            </Paper>
        </Box>
    );
};

export default DetArqueoGastos;

import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Button,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete
} from '@mui/material';
import TextField from '../../components/UppercaseTextField';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTerminal } from '../../hooks/useTerminal';
import { planillasService } from '../../services/planillas.service';
import { sectorService } from '../../services/sector.service';
import RequirePermission from '../../components/RequirePermission';

const PlanillaFuncionarios: React.FC = () => {
    const { idTerminalWeb } = useTerminal();
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [tiposPlanilla, setTiposPlanilla] = useState<any[]>([]);
    const [idTipoPlanilla, setIdTipoPlanilla] = useState(1);

    // Data Lists
    const [funcionarios, setFuncionarios] = useState<any[]>([]);
    const [sectores, setSectores] = useState<any[]>([]);

    // Form State
    const [selectedFuncionario, setSelectedFuncionario] = useState<any>(null);
    const [selectedSector, setSelectedSector] = useState<any>(null);

    const [items, setItems] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Refs
    const funcionarioRef = useRef<HTMLInputElement>(null);
    const sectorRef = useRef<HTMLInputElement>(null);
    const agregarRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    useEffect(() => {
        if (idTerminalWeb) {
            cargarDetalles();
        }
    }, [idTerminalWeb]);

    const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextRef.current?.focus();
        }
    };

    const cargarDatosIniciales = async () => {
        try {
            const [tipos, funcs, secs] = await Promise.all([
                planillasService.obtenerTipoPlanillaFun(),
                planillasService.consultaFuncionariosActivos(),
                sectorService.consultaSectoresActivos()
            ]);
            setTiposPlanilla(tipos || []);
            setFuncionarios(funcs || []);
            setSectores(secs || []);
        } catch (err: any) {
            console.error(err);
            setError('Error al cargar datos iniciales');
        }
    };

    const cargarDetalles = async () => {
        if (!idTerminalWeb) return;
        try {
            const data = await planillasService.consultaDetPlanillaFunTmp(idTerminalWeb);
            console.log(data);
            setItems(data || []);
        } catch (err: any) {
            console.error(err);
            setError('Error al cargar detalles');
        }
    };

    const handleAgregar = async () => {
        if (!idTerminalWeb) {
            setError('Terminal no configurada');
            return;
        }
        if (!selectedFuncionario) {
            setError('Debe seleccionar un funcionario');
            return;
        }

        setLoading(true);
        try {
            await planillasService.agregarDetPlanillaFunTmp(idTerminalWeb, selectedFuncionario.idFuncionario);
            await cargarDetalles();
            setSelectedFuncionario(null);
            setSelectedSector(null);
            setSuccess('Funcionario agregado correctamente');
            // Focus back to start
            // We can't easily focus autocomplete input via ref in MUI v5 standard way without some tricks, 
            // but we can try to focus the next logical element or just keep focus management simple.
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (idDetPlanillaFunTmp: number) => {
        if (!idTerminalWeb) return;
        try {
            await planillasService.eliminarDetPlanillaFunTmp(idTerminalWeb, idDetPlanillaFunTmp);
            await cargarDetalles();
            setSuccess('Eliminado correctamente');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleGuardar = async () => {
        if (!idTerminalWeb) return;
        if (items.length === 0) {
            setError('No hay items en la planilla');
            return;
        }

        setLoading(true);
        try {
            await planillasService.guardarPlanillaFuncionario({
                idUsuario: 1, // TODO: Get from context
                idTerminalWeb,
                fechaPlanilla: fecha,
                idTipoPlanilla
            });
            setSuccess('Planilla guardada exitosamente');
            setItems([]);
            setSelectedFuncionario(null);
            setSelectedSector(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                handleGuardar();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleGuardar]); // Added dependency to ensure latest state is used if needed

    return (
        <RequirePermission permission="ACCESO_SANATORIO">
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Planilla de Funcionarios
                </Typography>

                {/* Header Controls */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Tipo Planilla</InputLabel>
                                <Select
                                    value={idTipoPlanilla}
                                    label="Tipo Planilla"
                                    onChange={(e) => setIdTipoPlanilla(Number(e.target.value))}
                                >
                                    {tiposPlanilla.map((tipo) => (
                                        <MenuItem key={tipo.idTipoPlanillaFun} value={tipo.idTipoPlanillaFun}>
                                            {tipo.nombreTipoPlanillaFun}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Fecha"
                                size="small"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                onKeyDown={(e) => handleKeyDown(e, funcionarioRef)}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                {/* Messages */}
                {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

                {/* Input Form */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item size={3}>
                            <Autocomplete
                                options={funcionarios}
                                getOptionLabel={(option) => option.nombreFuncionario || ''}
                                value={selectedFuncionario}
                                ref={funcionarioRef}
                                onChange={(_, newValue) => {
                                    setSelectedFuncionario(newValue);
                                    if (newValue && newValue.idSector) {
                                        const sector = sectores.find(s => s.idSector === newValue.idSector);
                                        if (sector) {
                                            setSelectedSector(sector);
                                        }
                                    } else {
                                        setSelectedSector(null);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Funcionario" size="small" fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid size={3}>
                            <Autocomplete
                                options={sectores}
                                getOptionLabel={(option) => option.nombreSector || ''}
                                value={selectedSector}
                                ref={sectorRef}
                                onChange={(_, newValue) => setSelectedSector(newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Sector" size="small" fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAgregar}
                                ref={agregarRef}
                                startIcon={<AddIcon />}
                                fullWidth
                            >
                                Agregar
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Table */}
                <TableContainer component={Paper} sx={{ mb: 2, maxHeight: '400px' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nro</TableCell>
                                <TableCell>Funcionario</TableCell>
                                <TableCell>Sector</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item.nombreFuncionario || item.funcionario}</TableCell>
                                    <TableCell>{item.nombreSector || item.sector || '-'}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleEliminar(item.idDetPlanillaFunTmp)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No hay funcionarios agregados
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Footer Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleGuardar}
                        disabled={loading || items.length === 0}
                    >
                        Guardar Planilla (F2)
                    </Button>
                </Box>
            </Box>
        </RequirePermission>
    );
};

export default PlanillaFuncionarios;

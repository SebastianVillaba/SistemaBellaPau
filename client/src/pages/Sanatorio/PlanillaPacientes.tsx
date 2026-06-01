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
    Checkbox,
    FormControlLabel
} from '@mui/material';
import TextField from '../../components/UppercaseTextField';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTerminal } from '../../hooks/useTerminal';
import { planillasService } from '../../services/planillas.service';
import CheckIcon from '@mui/icons-material/Check';
import RequirePermission from '../../components/RequirePermission';

const PlanillaPacientes: React.FC = () => {
    const { idTerminalWeb } = useTerminal();
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [tipoPlanilla, setTipoPlanilla] = useState<any[]>([]);
    const [idTipoPlanilla, setIdTipoPlanilla] = useState(1); // Default to 1 for now

    // Form State
    const [sala, setSala] = useState('');
    const [ci, setCi] = useState('');
    const [nombreApellido, setNombreApellido] = useState('');
    const [desayuno, setDesayuno] = useState(false);
    const [almuerzo, setAlmuerzo] = useState(false);
    const [merienda, setMerienda] = useState(false);
    const [cena, setCena] = useState(false);

    const [items, setItems] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Refs for navigation
    const salaRef = useRef<HTMLInputElement>(null);
    const ciRef = useRef<HTMLInputElement>(null);
    const nombreRef = useRef<HTMLInputElement>(null);
    const desayunoRef = useRef<HTMLButtonElement>(null);
    const almuerzoRef = useRef<HTMLButtonElement>(null);
    const meriendaRef = useRef<HTMLButtonElement>(null);
    const cenaRef = useRef<HTMLButtonElement>(null);
    const agregarRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (idTerminalWeb) {
            cargarDetalles();
            cargarTipoPlanilla();
        }
    }, [idTerminalWeb]);

    const cargarTipoPlanilla = async () => {
        try {
            const data = await planillasService.obtenerTipoPlanillasPac();
            setTipoPlanilla(data);
        } catch (err: any) {
            console.error(err);
            setError('Error al cargar tipo de planilla');
        }
    }

    const cargarDetalles = async () => {
        if (!idTerminalWeb) return;
        try {
            const data = await planillasService.consultaDetPlanillaPacienteTmp(idTerminalWeb);
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
        if (!nombreApellido) {
            setError('El nombre es obligatorio');
            return;
        }

        setLoading(true);
        try {
            await planillasService.agregarDetPlanillaPacienteTmp({
                idTerminalWeb,
                nombreApellido,
                ci,
                sala: Number(sala) || 0,
                desayuno,
                almuerzo,
                merienda,
                cena
            });
            await cargarDetalles();
            limpiarFormulario();
            setSuccess('Paciente agregado correctamente');
            salaRef.current?.focus();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const limpiarFormulario = () => {
        setSala('');
        setCi('');
        setNombreApellido('');
        setDesayuno(false);
        setAlmuerzo(false);
        setMerienda(false);
        setCena(false);
    };

    const handleEliminar = async (idDetPlanillaPacTmp: number) => {
        if (!idTerminalWeb) return;
        try {
            await planillasService.eliminarDetPlanillaPacienteTmp(idTerminalWeb, idDetPlanillaPacTmp);
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
            await planillasService.guardarPlanillaPaciente({
                idUsuarioAlta: 1, // TODO: Get from context
                idTerminalWeb,
                fechaPlanilla: fecha,
                idTipoPlanillaPac: idTipoPlanilla
            });

            setSuccess('Planilla guardada exitosamente');
            setItems([]);
            limpiarFormulario();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Keyboard Navigation
    const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextRef.current?.focus();
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
    }, []);

    return (
        <RequirePermission permission="ACCESO_SANATORIO">
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Planilla de Pacientes
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
                                    {tipoPlanilla.map((tipo) => (
                                        <MenuItem key={tipo.idTipoPlanillaPac} value={tipo.idTipoPlanillaPac}>
                                            {tipo.nombreTipoPlanillaPac}
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
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                label="Hab."
                                size="small"
                                value={sala}
                                onChange={(e) => setSala(e.target.value)}
                                inputRef={salaRef}
                                onKeyDown={(e) => handleKeyDown(e, ciRef)}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                label="C.I"
                                size="small"
                                value={ci}
                                onChange={(e) => setCi(e.target.value)}
                                inputRef={ciRef}
                                onKeyDown={(e) => handleKeyDown(e, nombreRef)}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Nombre y Apellido"
                                size="small"
                                value={nombreApellido}
                                onChange={(e) => setNombreApellido(e.target.value)}
                                inputRef={nombreRef}
                                onKeyDown={(e) => handleKeyDown(e, desayunoRef)}
                            />
                        </Grid>
                        <Grid item xs={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={desayuno}
                                        onChange={(e) => setDesayuno(e.target.checked)}
                                        inputRef={desayunoRef}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                almuerzoRef.current?.focus();
                                            }
                                        }}
                                    />
                                }
                                label="D"
                                labelPlacement="top"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={almuerzo}
                                        onChange={(e) => setAlmuerzo(e.target.checked)}
                                        inputRef={almuerzoRef}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                meriendaRef.current?.focus();
                                            }
                                        }}
                                    />
                                }
                                label="A"
                                labelPlacement="top"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={merienda}
                                        onChange={(e) => setMerienda(e.target.checked)}
                                        inputRef={meriendaRef}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                cenaRef.current?.focus();
                                            }
                                        }}
                                    />
                                }
                                label="M"
                                labelPlacement="top"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={cena}
                                        onChange={(e) => setCena(e.target.checked)}
                                        inputRef={cenaRef}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                agregarRef.current?.focus();
                                            }
                                        }}
                                    />
                                }
                                label="C"
                                labelPlacement="top"
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAgregar}
                                ref={agregarRef}
                                sx={{ ml: 1, minWidth: '40px', height: '40px' }}
                            >
                                <AddIcon />
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
                                <TableCell>Hab</TableCell>
                                <TableCell>Cedula</TableCell>
                                <TableCell>Nombre y Apellido</TableCell>
                                <TableCell align="center">Desayuno</TableCell>
                                <TableCell align="center">Almuerzo</TableCell>
                                <TableCell align="center">Merienda</TableCell>
                                <TableCell align="center">Cena</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item.sala}</TableCell>
                                    <TableCell>{item.ci}</TableCell>
                                    <TableCell>{item.nombreApellido}</TableCell>
                                    <TableCell align="center">{item.desayuno ? <CheckIcon /> : ''}</TableCell>
                                    <TableCell align="center">{item.almuerzo ? <CheckIcon /> : ''}</TableCell>
                                    <TableCell align="center">{item.merienda ? <CheckIcon /> : ''}</TableCell>
                                    <TableCell align="center">{item.cena ? <CheckIcon /> : ''}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleEliminar(item.idDetPlanillaPacTmp)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        No hay pacientes agregados
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
                        Guardar Planilla
                    </Button>
                </Box>
            </Box>
        </RequirePermission>
    );
};

export default PlanillaPacientes;

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Alert,
    IconButton,
    Collapse
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { auditoriaService } from '../../services/auditoria.service';
import type {Auditoria as AuditoriaType} from '../../services/auditoria.service';
import { format } from 'date-fns';

const Row = ({ row }: { row: AuditoriaType }) => {
    const [open, setOpen] = useState(false);

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{format(new Date(row.fechaAuditoria), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                <TableCell>{row.nombreTabla}</TableCell>
                <TableCell>{row.TipoOperacion}</TableCell>
                <TableCell>{row.UsuarioResponsable}</TableCell>
                <TableCell>{row.Computadora}</TableCell>
                <TableCell>{row.ResumenCambio}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Detalle XML
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Valor Anterior:</Typography>
                                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                                        {row.valorAnterior || 'N/A'}
                                    </pre>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Valor Nuevo:</Typography>
                                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                                        {row.valorNuevo || 'N/A'}
                                    </pre>
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

const Auditoria = () => {
    const [auditorias, setAuditorias] = useState<AuditoriaType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nombreTabla, setNombreTabla] = useState('');
    const [fechaDesde, setFechaDesde] = useState<Date | null>(new Date());
    const [fechaHasta, setFechaHasta] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() + 1)));

    const fetchAuditoria = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await auditoriaService.consultarAuditoria({
                nombreTabla: nombreTabla || undefined,
                fechaDesde,
                fechaHasta
            });
            setAuditorias(data);
        } catch (err) {
            setError('Error al cargar los registros de auditoría.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditoria();
    }, []);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Auditoría del Sistema
                </Typography>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Nombre Tabla"
                                value={nombreTabla}
                                onChange={(e) => setNombreTabla(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <DatePicker
                                label="Fecha Desde"
                                value={fechaDesde}
                                onChange={(newValue) => setFechaDesde(newValue)}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <DatePicker
                                label="Fecha Hasta"
                                value={fechaHasta}
                                onChange={(newValue) => setFechaHasta(newValue)}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={fetchAuditoria}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Buscar'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TableContainer component={Paper}>
                    <Table aria-label="collapsible table">
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Fecha</TableCell>
                                <TableCell>Tabla</TableCell>
                                <TableCell>Operación</TableCell>
                                <TableCell>Usuario</TableCell>
                                <TableCell>Equipo</TableCell>
                                <TableCell>Resumen</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {auditorias.map((row) => (
                                <Row key={row.idAuditoria} row={row} />
                            ))}
                            {auditorias.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No se encontraron registros
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </LocalizationProvider>
    );
};

export default Auditoria;

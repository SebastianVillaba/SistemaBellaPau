import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    IconButton,
    Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { remisionService } from '../services/remision.service';
import { useTerminal } from '../hooks/useTerminal';
import RequirePermission from '../components/RequirePermission';

const RecepcionesPendientes: React.FC = () => {
    const { idTerminalWeb } = useTerminal();
    const [remisiones, setRemisiones] = useState<any[]>([]);
    const [selectedRemision, setSelectedRemision] = useState<any | null>(null);
    const [detalles, setDetalles] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // TODO: Obtener idUsuario del contexto real
    const idUsuario = 1;

    const cargarRemisiones = async () => {
        if (!idTerminalWeb) return;
        try {
            const data = await remisionService.consultaRemisionesEntrantes(idTerminalWeb);
            setRemisiones(data);
        } catch (err: any) {
            setError('Error al cargar remisiones pendientes');
            console.error(err);
        }
    };

    useEffect(() => {
        cargarRemisiones();
    }, [idTerminalWeb]);

    const handleVerDetalle = async (remision: any) => {
        setLoading(true);
        try {
            const data = await remisionService.consultaDetRemisionEntrante(remision.idRemision);
            setDetalles(data);
            setSelectedRemision(remision);
            setOpenModal(true);
        } catch (err: any) {
            setError('Error al cargar detalle de la remisión');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRecibir = async () => {
        if (!selectedRemision) return;
        setLoading(true);
        try {
            await remisionService.recibirRemision({
                idRemision: selectedRemision.idRemision,
                idUsuarioReceptor: idUsuario
            });
            setSuccess(`Remisión #${selectedRemision.idRemision} recibida correctamente`);
            setOpenModal(false);
            setSelectedRemision(null);
            setDetalles([]);
            cargarRemisiones(); // Recargar lista
        } catch (err: any) {
            setError(err.message || 'Error al recibir la remisión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <RequirePermission permission="ACCESO_REMISIONES">
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Recepciones Pendientes
                </Typography>

                {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID Remisión</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Origen</TableCell>
                                <TableCell>Observación</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {remisiones.map((remision) => (
                                <TableRow key={remision.idRemision} hover>
                                    <TableCell>{remision.idRemision}</TableCell>
                                    <TableCell>{new Date(remision.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell>{remision.depositoOrigen}</TableCell>
                                    <TableCell>{remision.observacion}</TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Ver Detalle y Recibir">
                                            <IconButton color="primary" onClick={() => handleVerDetalle(remision)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {remisiones.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No hay remisiones pendientes de recepción.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Modal de Detalle */}
                <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
                    <DialogTitle>
                        Detalle de Remisión #{selectedRemision?.idRemision}
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1"><strong>Origen:</strong> {selectedRemision?.depositoOrigen}</Typography>
                            <Typography variant="subtitle1"><strong>Observación:</strong> {selectedRemision?.observacion}</Typography>
                        </Box>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Código</TableCell>
                                        <TableCell>Producto</TableCell>
                                        <TableCell align="right">Cantidad</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {detalles.map((detalle, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{detalle.codigo}</TableCell>
                                            <TableCell>{detalle.nombreMercaderia}</TableCell>
                                            <TableCell align="right">{detalle.cantidadEnviada}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenModal(false)} color="inherit">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleRecibir}
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : 'Recibir Remisión'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </RequirePermission>
    );
};

export default RecepcionesPendientes;

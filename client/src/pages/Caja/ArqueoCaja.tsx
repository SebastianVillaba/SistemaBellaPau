import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Card,
    CardHeader,
    CardContent,
    Chip,
    Alert,
    CircularProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import MoneyIcon from '@mui/icons-material/Money';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import SyncIcon from '@mui/icons-material/Sync';

import DetArqueoEfectivo from '../../components/Caja/detArqueoEfectivo';
import DetArqueoGastos from '../../components/Caja/detArqueoGastos';
import DetArqueoTransferencias from '../../components/Caja/detArqueoTransferencias';
import RequirePermission from '../../components/RequirePermission';
import { useTerminal } from '../../hooks/useTerminal';
import { cajaService } from '../../services/caja.service';
import { reporteService } from '../../services/reporte.service';
import { ticketService } from '../../services/ticket.service';

const ArqueoCaja: React.FC = () => {
    const { idTerminalWeb, nroCaja, estadoCaja } = useTerminal();

    // Estado de la caja
    const [cajaAbierta, setCajaAbierta] = useState(false);
    const [idMovimientoCaja, setIdMovimientoCaja] = useState<number | null>(null);
    const [nroCajaEstado, setNroCajaEstado] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Totales de las secciones
    const [totalEfectivo, setTotalEfectivo] = useState(0);
    const [totalGastos, setTotalGastos] = useState(0);

    // Verificar estado de caja al cargar
    useEffect(() => {
        if (idTerminalWeb && nroCaja && estadoCaja) {
            const storedIdMovimiento = localStorage.getItem('idMovimientoCaja');
            if (storedIdMovimiento) {
                setIdMovimientoCaja(parseInt(storedIdMovimiento, 10));
            } else {
                setIdMovimientoCaja(nroCaja);
            }
            setCajaAbierta(true);
            setNroCajaEstado(nroCaja);
        }
    }, [idTerminalWeb, nroCaja, estadoCaja]);

    const handleIniciarCaja = async () => {
        if (!idTerminalWeb) {
            setError('No hay terminal configurada');
            return;
        }

        // Verificar que haya arqueo cargado
        if (totalEfectivo <= 0) {
            setError('Debe cargar el arqueo de efectivo antes de iniciar la caja');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const idUsuario = parseInt(localStorage.getItem('idUsuario') || '1');

            const response = await cajaService.abrirCaja(idUsuario, idTerminalWeb);

            if (response.success && response.idMovimientoCaja) {
                localStorage.setItem('idMovimientoCaja', response.idMovimientoCaja.toString());
                localStorage.setItem('idCajaActual', '1'); // TODO: Obtener del backend

                setIdMovimientoCaja(response.idMovimientoCaja);
                setCajaAbierta(true);
                setNroCajaEstado(1); // TODO: Obtener del backend
                setSuccess('Caja abierta exitosamente');
            }
        } catch (err: any) {
            console.error('Error al abrir caja:', err);
            setError(err.response?.data?.message || 'Error al abrir la caja');
        } finally {
            setLoading(false);
        }
    };

    const handleCerrarCaja = async () => {
        if (!idTerminalWeb || !idMovimientoCaja) {
            setError('No hay caja abierta para cerrar');
            return;
        }

        // Verificar que haya arqueo de cierre
        if (totalEfectivo <= 0) {
            setError('Debe cargar el arqueo de cierre antes de cerrar la caja');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const idUsuario = parseInt(localStorage.getItem('idUsuario') || '1');

            const response = await cajaService.cerrarCaja(idUsuario, idTerminalWeb);

            if (response.success) {
                localStorage.removeItem('idMovimientoCaja');
                localStorage.removeItem('idCajaActual');

                setIdMovimientoCaja(null);
                setCajaAbierta(false);
                setNroCajaEstado(null);
                setSuccess('Caja cerrada exitosamente');

                // Generar reporte de cierre de caja
                const idParaReporte = response.idMovimientoCaja || idMovimientoCaja;
                if (idParaReporte) {
                    try {
                        const datosReporte = await reporteService.obtenerDatosCierreCaja(idParaReporte);
                        await ticketService.generarTicketCierreCaja(datosReporte);
                    } catch (reporteError: any) {
                        console.error('Error al generar reporte de cierre:', reporteError);
                        setError('Caja cerrada pero hubo un error al generar el reporte');
                    }
                }
            }
        } catch (err: any) {
            console.error('Error al cerrar caja:', err);
            setError(err.response?.data?.message || 'Error al cerrar la caja');
        } finally {
            setLoading(false);
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
        <RequirePermission permission="ACCESO_CAJA">
            <Box sx={{ p: 2 }}>
                {/* Cabecera con estado de caja */}
                <Paper
                    sx={{
                        p: 3,
                        mb: 3,
                        background: cajaAbierta
                            ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
                            : 'linear-gradient(135deg, #9e9e9e 0%, #616161 100%)',
                        color: 'white',
                    }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <PointOfSaleIcon sx={{ fontSize: 48 }} />
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">
                                        Arqueo de Caja
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                        {nroCajaEstado && (
                                            <Chip
                                                label={`Caja Nro: ${nroCajaEstado}`}
                                                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                            />
                                        )}
                                        <Chip
                                            label={cajaAbierta ? 'ABIERTA' : 'CERRADA'}
                                            color={cajaAbierta ? 'success' : 'default'}
                                            sx={{
                                                fontWeight: 'bold',
                                                backgroundColor: cajaAbierta ? '#81c784' : 'rgba(255,255,255,0.3)',
                                                color: 'white',
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (cajaAbierta ? <StopIcon /> : <PlayArrowIcon />)}
                                onClick={cajaAbierta ? handleCerrarCaja : handleIniciarCaja}
                                disabled={loading}
                                sx={{
                                    backgroundColor: cajaAbierta ? '#f44336' : '#ffffff',
                                    color: cajaAbierta ? 'white' : '#4caf50',
                                    '&:hover': {
                                        backgroundColor: cajaAbierta ? '#d32f2f' : '#f5f5f5',
                                    },
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                }}
                            >
                                {cajaAbierta ? 'Cerrar Caja' : 'Iniciar Caja'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Mensajes */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                        {success}
                    </Alert>
                )}

                {/* Resumen de totales */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Total Efectivo
                                </Typography>
                                <Typography variant="h5" color="success.main" fontWeight="bold">
                                    Gs. {formatCurrency(totalEfectivo)}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Total Gastos
                                </Typography>
                                <Typography variant="h5" color="error.main" fontWeight="bold">
                                    Gs. {formatCurrency(totalGastos)}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Saldo Neto
                                </Typography>
                                <Typography variant="h5" color="primary.main" fontWeight="bold">
                                    Gs. {formatCurrency(totalEfectivo - totalGastos)}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Secciones modulares */}
                <Grid container spacing={3}>
                    {/* Arqueo de Efectivo */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card elevation={3}>
                            <CardHeader
                                avatar={<MoneyIcon color="success" />}
                                title={
                                    <Typography variant="h6" fontWeight="bold">
                                        💵 Arqueo de Efectivo (Guaraníes)
                                    </Typography>
                                }
                                sx={{ backgroundColor: '#e8f5e9', borderBottom: '1px solid #c8e6c9' }}
                            />
                            <CardContent>
                                <DetArqueoEfectivo
                                    idTerminalWeb={idTerminalWeb || 0}
                                    onTotalChange={setTotalEfectivo}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Gastos */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card elevation={3}>
                            <CardHeader
                                avatar={<MoneyOffIcon color="error" />}
                                title={
                                    <Typography variant="h6" fontWeight="bold">
                                        📝 Gastos
                                    </Typography>
                                }
                                sx={{
                                    backgroundColor: cajaAbierta
                                        ? 'rgba(251, 209, 209, 1)'
                                        : 'rgba(180, 180, 180, 0.4)',
                                    borderBottom: '1px solid #ffcdd2'
                                }}
                            />
                            <CardContent>
                                <DetArqueoGastos
                                    idTerminalWeb={idTerminalWeb || 0}
                                    idMovimientoCaja={idMovimientoCaja}
                                    onTotalChange={setTotalGastos}
                                    disabled={!cajaAbierta}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Transferencias */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card elevation={3}>
                            <CardHeader
                                avatar={<SyncIcon color="primary" />}
                                title={
                                    <Typography variant="h6" fontWeight="bold">
                                        🔄 Transferencias
                                    </Typography>
                                }
                                sx={{
                                    backgroundColor: cajaAbierta
                                        ? '#e3f2fd'
                                        : 'rgba(180, 180, 180, 0.4)',
                                    borderBottom: '1px solid #bbdefb'
                                }}
                            />
                            <CardContent>
                                <DetArqueoTransferencias disabled={!cajaAbierta} />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </RequirePermission>
    );
};

export default ArqueoCaja;

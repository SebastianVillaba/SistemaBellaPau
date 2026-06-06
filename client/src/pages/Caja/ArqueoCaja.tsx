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
    TextField,
    InputAdornment,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import MoneyIcon from '@mui/icons-material/Money';
import RequirePermission from '../../components/RequirePermission';
import { useTerminal } from '../../hooks/useTerminal';
import { cajaService } from '../../services/caja.service';
import { reporteService } from '../../services/reporte.service';
import { ticketService } from '../../services/ticket.service';
import type { MovimientoCaja } from '../../types/caja.types';

const ArqueoCaja: React.FC = () => {
    const { idTerminalWeb, nroCaja, estadoCaja } = useTerminal();

    // Estado de la caja
    const [cajaAbierta, setCajaAbierta] = useState(false);
    const [idMovimientoCaja, setIdMovimientoCaja] = useState<number | null>(null);
    const [nroCajaEstado, setNroCajaEstado] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados para montos consolidados por divisa (Apertura)
    const [montoGs, setMontoGs] = useState<string>('');
    const [montoDolar, setMontoDolar] = useState<string>('');
    const [montoReal, setMontoReal] = useState<string>('');
    const [montoPeso, setMontoPeso] = useState<string>('');

    // Movimientos de Caja
    const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
    const [loadingMovimientos, setLoadingMovimientos] = useState(false);

    // Estados para cierre temporal
    const [isCajaParada, setIsCajaParada] = useState(false);
    const [tmpCierreData, setTmpCierreData] = useState<any | null>(null);
    const [totalGsManual, setTotalGsManual] = useState<string>('');
    const [totalDolarManual, setTotalDolarManual] = useState<string>('');
    const [totalRealManual, setTotalRealManual] = useState<string>('');
    const [totalPesoManual, setTotalPesoManual] = useState<string>('');

    const cargarMovimientos = async () => {
        const boxId = nroCaja || nroCajaEstado;
        if (!boxId) return;

        setLoadingMovimientos(true);
        try {
            const response = await cajaService.obtenerMovimientos(boxId);
            if (response.success) {
                setMovimientos(response.result || []);
            }
        } catch (err) {
            console.error('Error al cargar movimientos:', err);
        } finally {
            setLoadingMovimientos(false);
        }
    };

    // Cargar movimientos cuando nroCaja o nroCajaEstado están disponibles
    useEffect(() => {
        if (nroCaja || nroCajaEstado) {
            cargarMovimientos();
        }
    }, [nroCaja, nroCajaEstado]);

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

        const mGs = parseFloat(montoGs) || 0;
        const mDolar = parseFloat(montoDolar) || 0;
        const mReal = parseFloat(montoReal) || 0;
        const mPeso = parseFloat(montoPeso) || 0;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const idUsuario = parseInt(localStorage.getItem('idUsuario') || '1');

            const response = await cajaService.abrirCaja(
                idUsuario,
                idTerminalWeb,
                mGs,
                mDolar,
                mReal,
                mPeso
            );

            if (response.success && response.idMovimientoCaja) {
                localStorage.setItem('idMovimientoCaja', response.idMovimientoCaja.toString());
                localStorage.setItem('idCajaActual', '1'); // TODO: Obtener del backend

                setIdMovimientoCaja(response.idMovimientoCaja);
                setCajaAbierta(true);
                setNroCajaEstado(1); // TODO: Obtener del backend
                setSuccess('Caja abierta exitosamente');

                // Recargar historial de movimientos
                cargarMovimientos();

                // Limpiar inputs
                setMontoGs('');
                setMontoDolar('');
                setMontoReal('');
                setMontoPeso('');
            }
        } catch (err: any) {
            console.error('Error al abrir caja:', err);
            setError(err.response?.data?.message || 'Error al abrir la caja');
        } finally {
            setLoading(false);
        }
    };

    const handlePararCaja = async () => {
        if (!idTerminalWeb) {
            setError('No hay terminal configurada');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const idPersonal = user?.idPersonal || user?.idUsuario || 1;

            const loadRes = await cajaService.cargarTmpCierreCaja(idTerminalWeb, idPersonal);
            
            if (loadRes.success) {
                const consultaRes = await cajaService.getConsultaTmpCierreCaja(idTerminalWeb);
                if (consultaRes.success) {
                    setTmpCierreData(consultaRes.result);
                    setIsCajaParada(true);
                    setSuccess('Caja parada exitosamente. Verifique los totales del sistema e ingrese el arqueo físico.');
                    
                    // Recargar historial de movimientos
                    cargarMovimientos();
                } else {
                    setError('Se paró la caja pero no se pudieron obtener los totales del sistema.');
                }
            } else {
                setError(loadRes.message || 'Error al parar la caja');
            }
        } catch (err: any) {
            console.error('Error al parar la caja:', err);
            setError(err.response?.data?.message || 'Error al parar la caja');
        } finally {
            setLoading(false);
        }
    };

    const handleCerrarCaja = async () => {
        if (!idTerminalWeb || !idMovimientoCaja) {
            setError('No hay caja abierta para cerrar');
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

                // Limpiar estados de cierre temporal
                setTmpCierreData(null);
                setIsCajaParada(false);
                setTotalGsManual('');
                setTotalDolarManual('');
                setTotalPesoManual('');
                setTotalRealManual('');

                // Recargar historial de movimientos
                cargarMovimientos();

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

    const handleImprimirReporte = async (idMovimiento: number) => {
        try {
            const data = await reporteService.obtenerDatosCierreCaja(idMovimiento);
            if (data.success) {
                await ticketService.generarTicketCierreCaja(data);
            }
        } catch (error: any) {
            console.error('Error al imprimir reporte:', error);
            setError('Error al generar el reporte');
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Abierto';
        return new Date(dateString).toLocaleString('es-PY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                        <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { xs: 'left', md: 'right' }, display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
                            {cajaAbierta && (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    size="large"
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <StopIcon />}
                                    onClick={handlePararCaja}
                                    disabled={loading}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    Parar Caja
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (cajaAbierta ? <StopIcon /> : <PlayArrowIcon />)}
                                onClick={cajaAbierta ? handleCerrarCaja : handleIniciarCaja}
                                disabled={loading || (cajaAbierta && !isCajaParada)}
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

                {/* Secciones modulares */}
                <Grid container spacing={3}>
                    {!cajaAbierta ? (
                        /* Si la caja está cerrada, mostrar únicamente la sección de apertura */
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                    Ingrese los montos iniciales por divisa para iniciar la caja:
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Guaraníes (Gs.)"
                                            type="number"
                                            value={montoGs}
                                            onChange={(e) => setMontoGs(e.target.value)}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">₲</InputAdornment>,
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Dólares (USD)"
                                            type="number"
                                            value={montoDolar}
                                            onChange={(e) => setMontoDolar(e.target.value)}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Reales (BRL)"
                                            type="number"
                                            value={montoReal}
                                            onChange={(e) => setMontoReal(e.target.value)}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Pesos (ARS)"
                                            type="number"
                                            value={montoPeso}
                                            onChange={(e) => setMontoPeso(e.target.value)}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    ) : (
                        /* Si la caja está abierta, mostrar únicamente la sección de cierre */
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Movimientos de Control */}
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                                        Movimientos de Control
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <TextField
                                                fullWidth
                                                label="Mov. Inicial 1"
                                                value={tmpCierreData?.idMovIni1 || ''}
                                                disabled
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <TextField
                                                fullWidth
                                                label="Mov. Final 1"
                                                value={tmpCierreData?.idMovFin1 || ''}
                                                disabled
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <TextField
                                                fullWidth
                                                label="Mov. Inicial 2"
                                                value={tmpCierreData?.idMovIni2 || ''}
                                                disabled
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <TextField
                                                fullWidth
                                                label="Mov. Final 2"
                                                value={tmpCierreData?.idMovFin2 || ''}
                                                disabled
                                                size="small"
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Divider />

                                {/* Totales del Sistema */}
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                                        Totales del Sistema (Tarjetas y Otros)
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="Tarjeta Crédito"
                                                value={formatCurrency(tmpCierreData?.totalTarjetaCredito || 0)}
                                                disabled
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start">₲</InputAdornment> }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="Tarjeta Débito"
                                                value={formatCurrency(tmpCierreData?.totalTarjetaDebito || 0)}
                                                disabled
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start">₲</InputAdornment> }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="Retiro Dinero"
                                                value={formatCurrency(tmpCierreData?.totalRetiroDinero || 0)}
                                                disabled
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start">₲</InputAdornment> }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="Total Gasto"
                                                value={formatCurrency(tmpCierreData?.totalGasto || 0)}
                                                disabled
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start">₲</InputAdornment> }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="Total Crédito"
                                                value={formatCurrency(tmpCierreData?.totalCredito || 0)}
                                                disabled
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start">₲</InputAdornment> }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                            <TextField
                                                fullWidth
                                                label="Total General"
                                                value={formatCurrency(tmpCierreData?.totalGeneral || 0)}
                                                disabled
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start">₲</InputAdornment> }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Divider />

                                {/* Ajuste Crítico de Monedas */}
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                                        Ajuste de Monedas (Sistema vs Físico)
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {/* Guaraníes */}
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Guaraníes (Sistema)"
                                                value={formatCurrency(tmpCierreData?.totalGsSistema || 0)}
                                                disabled
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start">₲</InputAdornment> }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Guaraníes (Físico Manual)"
                                                type="number"
                                                value={totalGsManual}
                                                onChange={(e) => setTotalGsManual(e.target.value)}
                                                disabled={!isCajaParada}
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start">₲</InputAdornment> }}
                                            />
                                        </Grid>

                                        {/* Dólares */}
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Dólares (Sistema)"
                                                value={formatCurrency(tmpCierreData?.totalDolarSistema || 0)}
                                                disabled
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Dólares (Físico Manual)"
                                                type="number"
                                                value={totalDolarManual}
                                                onChange={(e) => setTotalDolarManual(e.target.value)}
                                                disabled={!isCajaParada}
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                            />
                                        </Grid>

                                        {/* Reales */}
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Reales (Sistema)"
                                                value={formatCurrency(tmpCierreData?.totalRealSistema || 0)}
                                                disabled
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Reales (Físico Manual)"
                                                type="number"
                                                value={totalRealManual}
                                                onChange={(e) => setTotalRealManual(e.target.value)}
                                                disabled={!isCajaParada}
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                                            />
                                        </Grid>

                                        {/* Pesos */}
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Pesos (Sistema)"
                                                value={formatCurrency(tmpCierreData?.totalPesoSistema || 0)}
                                                disabled
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            <TextField
                                                fullWidth
                                                label="Pesos (Físico Manual)"
                                                type="number"
                                                value={totalPesoManual}
                                                onChange={(e) => setTotalPesoManual(e.target.value)}
                                                disabled={!isCajaParada}
                                                size="small"
                                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>
                        </Grid>
                    )}
                </Grid>

                {/* Historial de Movimientos */}
                <Box sx={{ mt: 4 }}>
                    {loadingMovimientos ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : movimientos.length > 0 ? (
                        <>
                            <Typography variant="h6" fontWeight="bold">
                                📋 Historial de Movimientos de Caja
                            </Typography>
                            <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#eeeeee' }}>ID</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#eeeeee' }}>Responsable Apertura</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#eeeeee' }}>Monto Inicial</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#eeeeee' }}>Fecha Apertura</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#eeeeee' }}>Responsable Cierre</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#eeeeee' }}>Fecha Cierre</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#eeeeee' }}>Monto Contado</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#eeeeee' }}>Monto Sistema</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#eeeeee' }}>Estado</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: '#eeeeee' }}>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {movimientos.map((mov) => {
                                            const idMovimientoCajaActual = localStorage.getItem('idMovimientoCaja');
                                            const esMovimientoActual = idMovimientoCajaActual &&
                                                parseInt(idMovimientoCajaActual) === mov.idMovimientoCaja;

                                            return (
                                                <TableRow key={mov.idMovimientoCaja} hover sx={{ backgroundColor: esMovimientoActual ? '#e8f5e9' : 'transparent' }}>
                                                    <TableCell>{mov.idMovimientoCaja}</TableCell>
                                                    <TableCell>{mov.responsableApertura}</TableCell>
                                                    <TableCell>₲ {formatCurrency(mov.montoInicial || 0)}</TableCell>
                                                    <TableCell>{formatDate(mov.fechaApertura)}</TableCell>
                                                    <TableCell>{mov.responsableCierre || '-'}</TableCell>
                                                    <TableCell>{formatDate(mov.fechaCierre)}</TableCell>
                                                    <TableCell>₲ {formatCurrency(mov.montoContadoCajero || 0)}</TableCell>
                                                    <TableCell>₲ {formatCurrency(mov.montoSistema || 0)}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={mov.estado}
                                                            color={mov.estado === 'ABIERTA' ? 'success' : 'default'}
                                                            size="small"
                                                            sx={{ fontWeight: 'bold' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {mov.fechaCierre && (
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() => handleImprimirReporte(mov.idMovimientoCaja)}
                                                            >
                                                                Reporte
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    ) : (
                        <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                            No hay movimientos registrados para esta caja.
                        </Typography>
                    )}
                </Box>
            </Box>
        </RequirePermission>
    );
};

export default ArqueoCaja;

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Collapse,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
} from '@mui/material';
import TextField from './UppercaseTextField';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import type { Caja, MovimientoCaja, ArqueoCajaTmpItem } from '../types/caja.types';
import axios from 'axios';
import { reporteService } from '../services/reporte.service';
import { ticketService } from '../services/ticket.service';
import { cajaService, DENOMINACIONES } from '../services/caja.service';
import { useTerminal } from '../hooks/useTerminal';

interface CajaSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelectCaja: (caja: Caja) => void;
}

const CajaSelectorModal: React.FC<CajaSelectorModalProps> = ({
  open,
  onClose,
  onSelectCaja,
}) => {
  const { idTerminalWeb } = useTerminal();

  const [selectedCaja, setSelectedCaja] = useState<Caja | null>(null);
  const [expandedCaja, setExpandedCaja] = useState<number | null>(null);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [movimientos, setMovimientos] = useState<{ [key: number]: MovimientoCaja[] }>({});
  const [selectedMovimiento, setSelectedMovimiento] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // Estados para arqueo de caja
  const [arqueoItems, setArqueoItems] = useState<ArqueoCajaTmpItem[]>([]);
  const [totalArqueo, setTotalArqueo] = useState<number>(0);
  const [montoMoneda, setMontoMoneda] = useState<string>('');
  const [cantidadBillete, setCantidadBillete] = useState<{ [key: number]: string }>({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Cargar cajas cuando se abre el modal
  useEffect(() => {
    if (open) {
      cargarCajas();
    }
  }, [open]);

  // Cargar arqueo cuando se selecciona una caja
  useEffect(() => {
    if (selectedCaja && idTerminalWeb) {
      cargarArqueo();
    }
  }, [selectedCaja, idTerminalWeb]);

  const cargarCajas = async () => {
    setLoading(true);
    try {
      const idUsuario = localStorage.getItem('idUsuario') || '1';
      const response = await axios.get(`${API_URL}/caja/consultar`, {
        params: { idUsuario }
      });

      if (response.data.success) {
        setCajas(response.data.result);
      }
    } catch (error) {
      console.error('Error al cargar cajas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarMovimientos = async (idCaja: number) => {
    try {
      const response = await axios.get(`${API_URL}/caja/movimientos`, {
        params: { idCaja }
      });

      if (response.data.success) {
        setMovimientos(prev => ({
          ...prev,
          [idCaja]: response.data.result
        }));
      }
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
    }
  };

  const cargarArqueo = async () => {
    if (!idTerminalWeb) return;

    try {
      const response = await cajaService.listarArqueoCajaTmp(idTerminalWeb);
      if (response.success) {
        setArqueoItems(response.result);
        setTotalArqueo(response.totalArqueo || 0);
      }
    } catch (error) {
      console.error('Error al cargar arqueo:', error);
    }
  };

  const handleAgregarDenominacion = async (idDenominacion: number) => {
    if (!idTerminalWeb) {
      alert('Error: Terminal no identificada');
      return;
    }

    const cantidad = parseInt(cantidadBillete[idDenominacion] || '1');
    if (cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    setLoadingAction(true);
    try {
      await cajaService.agregarArqueoCajaTmp(idTerminalWeb, idDenominacion, cantidad);
      setCantidadBillete(prev => ({ ...prev, [idDenominacion]: '' }));
      await cargarArqueo();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al agregar denominación');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEliminarDenominacion = async (idArqueoTmp: number) => {
    
  }

  /**
   * Agrega un monto de monedas al arqueo de caja
   */
  const handleAgregarMoneda = async () => {
    if (!idTerminalWeb) {
      alert('Error: Terminal no identificada');
      return;
    }

    const monto = parseInt(montoMoneda);
    if (!monto || monto <= 0) {
      alert('Ingrese un monto válido');
      return;
    }

    setLoadingAction(true);
    try {
      // ID 7 para monedas (asumiendo que existe en la BD)
      await cajaService.agregarArqueoCajaTmp(idTerminalWeb, 7, monto);
      setMontoMoneda('');
      await cargarArqueo();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al agregar moneda');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSelectCaja = async (caja: Caja) => {
    const idCajaActual = localStorage.getItem('idCajaActual');

    // Si la caja está abierta (estadoCaja = true), verificar si es mi caja
    if (caja.estadoCaja === true) {
      const esMiCaja = idCajaActual && parseInt(idCajaActual) === caja.idCaja;
      if (!esMiCaja) {
        alert('Esta caja ya está abierta por otro usuario');
        return;
      }
    }

    if (expandedCaja === caja.idCaja) {
      setExpandedCaja(null);
    } else {
      setExpandedCaja(caja.idCaja);
      if (!movimientos[caja.idCaja]) {
        await cargarMovimientos(caja.idCaja);
      }
    }
    setSelectedCaja(caja);
    setSelectedMovimiento(null);
    // Limpiar estados de arqueo al cambiar de caja
    setArqueoItems([]);
    setTotalArqueo(0);
    setMontoMoneda('');
    setCantidadBillete({});
  };

  const handleAbrirCaja = async () => {
    if (!selectedCaja || !idTerminalWeb) {
      alert('Error: Seleccione una caja y asegúrese de tener terminal asignada');
      return;
    }

    if (totalArqueo <= 0) {
      alert('Por favor ingrese al menos una denominación para el arqueo inicial');
      return;
    }

    setLoadingAction(true);
    try {
      const idUsuario = localStorage.getItem('idUsuario') || '1';
      const response = await cajaService.abrirCaja(
        selectedCaja.idCaja,
        parseInt(idUsuario),
        totalArqueo,
        idTerminalWeb
      );

      if (response.success) {
        // Guardar el idMovimientoCaja que devuelve el SP
        const idMovimientoCaja = response.idMovimientoCaja;
        if (idMovimientoCaja) {
          localStorage.setItem('idMovimientoCaja', idMovimientoCaja.toString());
          localStorage.setItem('idCajaActual', selectedCaja.idCaja.toString());
        }

        alert('Caja abierta exitosamente');
        await cargarCajas();
        await cargarMovimientos(selectedCaja.idCaja);

        // Limpiar arqueo
        setArqueoItems([]);
        setTotalArqueo(0);

        // Cerrar el modal después de abrir la caja
        onSelectCaja(selectedCaja);
        handleCancel();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al abrir la caja');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCerrarCaja = async () => {
    if (!selectedCaja || !idTerminalWeb) {
      alert('Error: Seleccione una caja y asegúrese de tener terminal asignada');
      return;
    }

    if (totalArqueo <= 0) {
      alert('Por favor ingrese al menos una denominación para el arqueo final');
      return;
    }

    // Verificar que sea MI caja la que estoy cerrando
    const idMovimientoCaja = localStorage.getItem('idMovimientoCaja');
    const idCajaActual = localStorage.getItem('idCajaActual');

    if (!idMovimientoCaja || parseInt(idCajaActual || '0') !== selectedCaja.idCaja) {
      alert('Solo puedes cerrar la caja que tú abriste');
      return;
    }

    setLoadingAction(true);
    try {
      const idUsuario = localStorage.getItem('idUsuario') || '1';
      const response = await cajaService.cerrarCaja(
        parseInt(idMovimientoCaja),
        parseInt(idUsuario),
        totalArqueo,
        idTerminalWeb
      );

      if (response.success) {
        // Limpiar el localStorage después de cerrar la caja
        localStorage.removeItem('idMovimientoCaja');
        localStorage.removeItem('idCajaActual');

        alert('Caja cerrada exitosamente');
        await cargarCajas();
        await cargarMovimientos(selectedCaja.idCaja);

        // Limpiar arqueo
        setArqueoItems([]);
        setTotalArqueo(0);

        handleCancel();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cerrar la caja');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancel = () => {
    setSelectedCaja(null);
    setExpandedCaja(null);
    setSelectedMovimiento(null);
    setArqueoItems([]);
    setTotalArqueo(0);
    setMontoMoneda('');
    setCantidadBillete({});
    onClose();
  };

  const handleSelectMovimiento = (idMovimientoCaja: number) => {
    setSelectedMovimiento(idMovimientoCaja);
  };

  const handleImprimirReporte = async () => {
    if (!selectedMovimiento) return;

    setLoadingAction(true);
    try {
      const data = await reporteService.obtenerDatosCierreCaja(selectedMovimiento);
      if (data.success) {
        ticketService.generarTicketCierreCaja(data);
      }
    } catch (error: any) {
      alert(error.message || 'Error al generar el reporte');
    } finally {
      setLoadingAction(false);
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

  // Componente de UI para arqueo de denominaciones
  const ArqueoUI = ({ modo }: { modo: 'apertura' | 'cierre' }) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: modo === 'apertura' ? 'success.main' : 'error.main' }}>
        {modo === 'apertura' ? '💰 Arqueo de Apertura' : '💰 Arqueo de Cierre'}
      </Typography>

      {/* Grid de botones de denominaciones */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="subtitle2" gutterBottom>
          Billetes en Guaraníes
        </Typography>
        <Grid container spacing={1}>
          {DENOMINACIONES.map((denom) => (
            <Grid size={{ xs: 6, sm: 4 }} key={denom.id}>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <TextField
                  size="small"
                  type="number"
                  placeholder="Cant."
                  value={cantidadBillete[denom.id] || ''}
                  onChange={(e) => setCantidadBillete(prev => ({
                    ...prev,
                    [denom.id]: e.target.value
                  }))}
                  sx={{ width: 70 }}
                  inputProps={{ min: 1 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleAgregarDenominacion(denom.id)}
                  disabled={loadingAction}
                  sx={{
                    minWidth: 'auto',
                    px: 1,
                    backgroundColor: '#1976d2',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {formatCurrency(denom.valor)}
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Input para monedas */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            type="number"
            label="Monto en Monedas (Gs.)"
            value={montoMoneda}
            onChange={(e) => setMontoMoneda(e.target.value)}
            sx={{ flex: 1 }}
            inputProps={{ min: 1 }}
          />
          <IconButton
            color="primary"
            onClick={handleAgregarMoneda}
            disabled={loadingAction || !montoMoneda}
            sx={{ backgroundColor: '#e3f2fd' }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Tabla de items del arqueo */}
      {arqueoItems.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 2, maxHeight: 200 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>Denominación</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>Valor</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>Cantidad</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>Subtotal</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {arqueoItems.map((item) => (
                <TableRow key={item.idArqueoTmp}>
                  <TableCell>{item.nombreBillete}</TableCell>
                  <TableCell align="right">{formatCurrency(item.valor)}</TableCell>
                  <TableCell align="right">{item.cantidad}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(item.subtotal)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={() => handleEliminarItem(item.idArqueoTmp)}
                      disabled={loadingAction}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Total del arqueo */}
      <Paper sx={{ p: 2, backgroundColor: modo === 'apertura' ? '#e8f5e9' : '#ffebee' }}>
        <Typography variant="h5" align="right" sx={{ fontWeight: 'bold' }}>
          TOTAL: Gs. {formatCurrency(totalArqueo)}
        </Typography>
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* Botón de acción */}
      <Button
        variant="contained"
        color={modo === 'apertura' ? 'success' : 'error'}
        onClick={modo === 'apertura' ? handleAbrirCaja : handleCerrarCaja}
        disabled={loadingAction || totalArqueo <= 0}
        fullWidth
        size="large"
      >
        {loadingAction ? (
          <CircularProgress size={24} />
        ) : modo === 'apertura' ? (
          'Abrir Caja'
        ) : (
          'Cerrar Caja'
        )}
      </Button>
    </Box>
  );

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Gestión de Cajas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selecciona una caja para ver sus movimientos y gestionarla
        </Typography>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {cajas.map((caja) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={caja.idCaja}>
                  <Paper
                    elevation={selectedCaja?.idCaja === caja.idCaja ? 8 : 2}
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: caja.estadoCaja === true ? '#4caf50' : '#9e9e9e',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      border: selectedCaja?.idCaja === caja.idCaja ? '3px solid #fff' : 'none',
                      transform: selectedCaja?.idCaja === caja.idCaja ? 'scale(1.05)' : 'scale(1)',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: 6,
                      }
                    }}
                    onClick={() => handleSelectCaja(caja)}
                  >
                    {selectedCaja?.idCaja === caja.idCaja && (
                      <CheckCircleIcon
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          fontSize: 30,
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 120,
                      }}
                    >
                      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {caja.idCaja}
                      </Typography>
                      <Typography variant="h6" component="div" sx={{ mb: 0.5 }}>
                        {caja.nombreCaja}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 1,
                          px: 2,
                          py: 0.5,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: 1,
                        }}
                      >
                        {caja.estadoCaja === true ? 'Abierta' : 'Cerrada'}
                      </Typography>
                      {expandedCaja === caja.idCaja && (
                        <Box sx={{ mt: 1 }}>
                          {expandedCaja === caja.idCaja ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Sección expandida con movimientos y arqueo */}
            <Collapse in={expandedCaja !== null && selectedCaja !== null}>
              {selectedCaja && expandedCaja === selectedCaja.idCaja && (
                <Box sx={{ mt: 3 }}>
                  <Paper sx={{ p: 2 }}>
                    {/* Solo mostrar movimientos si es mi caja o está cerrada */}
                    {(() => {
                      const idCajaActual = localStorage.getItem('idCajaActual');
                      const esMiCaja = parseInt(idCajaActual || '0') === selectedCaja.idCaja;
                      const mostrarMovimientos = selectedCaja.estadoCaja === false || esMiCaja;

                      return mostrarMovimientos ? (
                        <>
                          <Typography variant="h6" gutterBottom>
                            Movimientos de {selectedCaja.nombreCaja}
                          </Typography>

                          {movimientos[selectedCaja.idCaja] && movimientos[selectedCaja.idCaja].length > 0 ? (
                            <TableContainer
                              sx={{
                                maxHeight: 300,
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                '& .MuiTableCell-root': {
                                  borderBottom: '1px solid #e0e0e0'
                                }
                              }}
                            >
                              <Table stickyHeader size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                      ID Movimiento
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                      Fecha Apertura
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                      Fecha Cierre
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                      Estado
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {movimientos[selectedCaja.idCaja].map((mov) => {
                                    const idMovimientoCajaActual = localStorage.getItem('idMovimientoCaja');
                                    const esMovimientoActual = idMovimientoCajaActual &&
                                      parseInt(idMovimientoCajaActual) === mov.idMovimientoCaja;
                                    const isSelected = selectedMovimiento === mov.idMovimientoCaja;

                                    return (
                                      <TableRow
                                        key={mov.idMovimientoCaja}
                                        onClick={() => handleSelectMovimiento(mov.idMovimientoCaja)}
                                        sx={{
                                          cursor: 'pointer',
                                          backgroundColor: esMovimientoActual
                                            ? '#e8f5e9'
                                            : isSelected
                                              ? '#f5f5f5'
                                              : 'transparent',
                                          '&:hover': {
                                            backgroundColor: esMovimientoActual
                                              ? '#c8e6c9'
                                              : '#f0f0f0'
                                          },
                                          transition: 'background-color 0.2s'
                                        }}
                                      >
                                        <TableCell>{mov.idMovimientoCaja}</TableCell>
                                        <TableCell>{formatDate(mov.fechaApertura)}</TableCell>
                                        <TableCell>{formatDate(mov.fechaCierre)}</TableCell>
                                        <TableCell>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              px: 1,
                                              py: 0.5,
                                              borderRadius: 1,
                                              backgroundColor: !mov.fechaCierre
                                                ? '#4caf50'
                                                : '#9e9e9e',
                                              color: 'white',
                                              fontWeight: 'bold'
                                            }}
                                          >
                                            {!mov.fechaCierre ? 'Abierto' : 'Cerrado'}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                              No hay movimientos registrados
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          Esta caja está siendo utilizada por otro usuario
                        </Typography>
                      );
                    })()}

                    {/* Controles de abrir/cerrar caja con arqueo */}
                    {(() => {
                      const idCajaActual = localStorage.getItem('idCajaActual');
                      const esMiCaja = parseInt(idCajaActual || '0') === selectedCaja.idCaja;
                      const mostrarControles = selectedCaja.estadoCaja === false || esMiCaja;

                      return mostrarControles ? (
                        <Box sx={{ mt: 3 }}>
                          {selectedCaja.estadoCaja === false ? (
                            selectedMovimiento ? (
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={handleImprimirReporte}
                                fullWidth
                              >
                                Imprimir Reporte
                              </Button>
                            ) : (
                              <ArqueoUI modo="apertura" />
                            )
                          ) : (() => {
                            // Verificar si el movimiento seleccionado es el actual
                            const idMovimientoCajaActual = localStorage.getItem('idMovimientoCaja');
                            const movimientoSeleccionado = selectedMovimiento
                              ? movimientos[selectedCaja.idCaja]?.find(m => m.idMovimientoCaja === selectedMovimiento)
                              : null;
                            const esMovimientoActual = idMovimientoCajaActual &&
                              movimientoSeleccionado &&
                              parseInt(idMovimientoCajaActual) === movimientoSeleccionado.idMovimientoCaja;
                            const esMovimientoCerrado = movimientoSeleccionado?.fechaCierre !== null;

                            // Si es el movimiento actual y está abierto, mostrar cerrar caja con arqueo
                            if (esMovimientoActual && !esMovimientoCerrado) {
                              return <ArqueoUI modo="cierre" />;
                            }

                            // Si hay un movimiento seleccionado y está cerrado, mostrar imprimir reporte
                            if (selectedMovimiento && esMovimientoCerrado) {
                              return (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={handleImprimirReporte}
                                  fullWidth
                                >
                                  Imprimir Reporte
                                </Button>
                              );
                            }

                            // Si no hay movimiento seleccionado, mostrar mensaje
                            return (
                              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                Selecciona un movimiento para ver las opciones disponibles
                              </Typography>
                            );
                          })()}
                        </Box>
                      ) : null;
                    })()}
                  </Paper>
                </Box>
              )}
            </Collapse>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCancel} variant="outlined" color="inherit">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CajaSelectorModal;

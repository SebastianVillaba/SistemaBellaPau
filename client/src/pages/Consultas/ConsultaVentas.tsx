import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import BlockIcon from '@mui/icons-material/Block';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { consultaVentaService } from '../../services/consultaVenta.service';

// ──────────────────────────────────────────────
// Tipos (se completarán cuando lleguen los SPs)
// ──────────────────────────────────────────────
interface VentaCabecera {
  idVenta: number;
  nroFactura: string;
  fechaHora: string;
  cliente: string;
  ruc: string;
  usuario: string;
  sucursal: string;
  total: number;
  estado: 'ACTIVO' | 'ANULADO';
  tipoVenta: string;
  tipoPago?: string;
}

interface VentaDetalle {
  nro: number;
  codigo: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  exenta: number;
  iva5: number;
  iva10: number;
}

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────
const ConsultaVentas: React.FC = () => {
  // ── Filtros ────────────────────────────────
  const [fechaDesde, setFechaDesde] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [fechaHasta, setFechaHasta] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [nroFactura, setNroFactura] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState<'fecha' | 'factura'>('fecha');

  // ── Resultados ─────────────────────────────
  const [ventas, setVentas] = useState<VentaCabecera[]>([]);
  const [selectedVenta, setSelectedVenta] = useState<VentaCabecera | null>(null);
  const [detalles, setDetalles] = useState<VentaDetalle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Navegación entre registros ──────────────
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // ── Handlers de búsqueda ────────────────────
  const handleBuscar = async () => {
    setIsLoading(true);
    setError('');
    setSelectedVenta(null);
    setDetalles([]);

    try {
      let result;
      if (tipoBusqueda === 'factura') {
        if (nroFactura.trim() === '') {
          throw new Error('Ingrese un número de factura válido.');
        }
        const parts = nroFactura.split('-');
        let dsuc = 1, dcaja = 1, dfactu = parseInt(nroFactura, 10);
        if (parts.length === 3) {
          dsuc = parseInt(parts[0], 10);
          dcaja = parseInt(parts[1], 10);
          dfactu = parseInt(parts[2], 10);
        }
        
        if (isNaN(dfactu)) {
          throw new Error('El formato de factura no es válido.');
        }

        result = await consultaVentaService.consultaVentaNroFactura(dsuc, dcaja, dfactu);
      } else {
        result = await consultaVentaService.consultaVentaFecha(fechaDesde, fechaHasta, 1);
      }

      const mapped = result.map((v: any) => ({
        idVenta: v.idVenta,
        nroFactura: v.factura,
        fechaHora: new Date(v.fechaAlta).toLocaleString('es-PY'),
        cliente: v.nombreCliente,
        ruc: v.ruc,
        usuario: v.usuario,
        sucursal: v.nombreSucursal || '',
        total: v.totalVenta,
        estado: v.estado,
        tipoVenta: v.nombreTipo,
        tipoPago: ''
      }));

      setVentas(mapped);
    } catch (err: any) {
      setError(err.message || 'Error al buscar ventas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBuscar();
  };

  // ── Seleccionar venta de la tabla ───────────
  const handleSelectVenta = async (venta: VentaCabecera, index: number) => {
    setSelectedVenta(venta);
    setCurrentIndex(index);
    setError('');

    try {
      const resp = await consultaVentaService.consultaInformacionVenta(venta.idVenta);
      
      // Extraemos la cabecera devuelta por el SP para actualizar los datos si es necesario
      if (resp.cabecera) {
        setSelectedVenta({
          idVenta: venta.idVenta,
          nroFactura: resp.cabecera.factura,
          fechaHora: new Date(resp.cabecera.fechaAlta).toLocaleString('es-PY'),
          cliente: resp.cabecera.nombreCliente,
          ruc: resp.cabecera.ruc,
          usuario: resp.cabecera.usuario,
          sucursal: resp.cabecera.nombreSucursal || '',
          total: resp.cabecera.totalVenta,
          estado: resp.cabecera.estado,
          tipoVenta: resp.cabecera.nombreTipo,
          tipoPago: '' // Puedes adaptarlo si el SP lo devuelve en el futuro
        });
      }
      
      const mappedDetalles = resp.detalle.map((d: any) => ({
        nro: d.Nro,
        codigo: d.codigo,
        descripcion: d.nombreProducto,
        cantidad: d.cantidad,
        precio: d.precioUnitario,
        subtotal: d.subtotal,
        exenta: 0,
        iva5: 0,
        iva10: 0
      }));
      setDetalles(mappedDetalles);
    } catch (err: any) {
      setError(err.message || 'Error al obtener el detalle');
    }
  };

  // ── Navegación entre registros ──────────────
  const navPrimero   = () => { if (ventas.length > 0) handleSelectVenta(ventas[0], 0); };
  const navAnterior  = () => { if (currentIndex > 0) handleSelectVenta(ventas[currentIndex - 1], currentIndex - 1); };
  const navSiguiente = () => { if (currentIndex < ventas.length - 1) handleSelectVenta(ventas[currentIndex + 1], currentIndex + 1); };
  const navUltimo    = () => { if (ventas.length > 0) handleSelectVenta(ventas[ventas.length - 1], ventas.length - 1); };

  // ── Helpers ─────────────────────────────────
  const formatMoneda = (v: number) => `₲ ${v.toLocaleString('es-PY')}`;
  const chipColor = (estado: string): 'success' | 'error' => estado === 'ACTIVO' ? 'success' : 'error';

  // ── Totales del detalle ──────────────────────
  const totalDetalle = detalles.reduce((s, d) => s + d.subtotal, 0);
  const exentaTotal  = detalles.reduce((s, d) => s + d.exenta,   0);
  const iva5Total    = detalles.reduce((s, d) => s + d.iva5,     0);
  const iva10Total   = detalles.reduce((s, d) => s + d.iva10,    0);

  // ── Inputs de filtro como filas ─────────────
  const sectionLabel = (text: string) => (
    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {text}
    </Typography>
  );

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: 1.5 }}>

      {/* ── Título ────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReceiptLongIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Consulta de Ventas
        </Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      {/* ── Panel de filtros (Stack horizontal) ── */}
      <Paper sx={{ p: 2 }}>
        {sectionLabel('Filtros de búsqueda')}
        <Stack direction="column" spacing={2} alignItems="flex-start">
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={tipoBusqueda}
              onChange={(e) => {
                setTipoBusqueda(e.target.value as 'fecha' | 'factura');
                setError('');
                setVentas([]);
                setSelectedVenta(null);
                setDetalles([]);
              }}
            >
              <FormControlLabel value="fecha" control={<Radio size="small" />} label="Por Fecha" />
              <FormControlLabel value="factura" control={<Radio size="small" />} label="Por Nro. Factura" />
            </RadioGroup>
          </FormControl>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start" flexWrap="wrap" useFlexGap sx={{ width: '100%' }}>
            {tipoBusqueda === 'fecha' ? (
              <>
                <TextField
                  label="Fecha desde"
                  type="date"
                  size="small"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  onKeyDown={handleKeyDown}
                  sx={{ minWidth: 155 }}
                />
                <TextField
                  label="Fecha hasta"
                  type="date"
                  size="small"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  onKeyDown={handleKeyDown}
                  sx={{ minWidth: 155 }}
                />
              </>
            ) : (
              <TextField
                label="Nro. Factura"
                size="small"
                value={nroFactura}
                onChange={(e) => setNroFactura(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="001-001-0000001"
                sx={{ minWidth: 200, flex: 1, maxWidth: 300 }}
                autoFocus
              />
            )}
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleBuscar}
              disabled={isLoading}
              sx={{ height: 40, alignSelf: 'flex-start' }}
            >
              Buscar
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* ── Lista de ventas ────────────────────── */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 1.5, pb: 0.5 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Resultados
            {ventas.length > 0 && (
              <Typography component="span" variant="body2" sx={{ ml: 1, color: 'primary.main' }}>
                ({ventas.length} registro{ventas.length !== 1 ? 's' : ''})
              </Typography>
            )}
          </Typography>
        </Box>
        <TableContainer sx={{ flex: 1 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nro. Factura</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha / Hora</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>RUC</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ventas.map((venta, i) => (
                <TableRow
                  key={venta.idVenta}
                  hover
                  selected={selectedVenta?.idVenta === venta.idVenta}
                  onClick={() => handleSelectVenta(venta, i)}
                  sx={{
                    cursor: 'pointer',
                    backgroundColor: venta.estado === 'ANULADO' ? 'rgba(244,67,54,0.05)' : undefined,
                    '&.Mui-selected': { backgroundColor: 'action.selected' }
                  }}
                >
                  <TableCell>{venta.idVenta}</TableCell>
                  <TableCell>{venta.nroFactura}</TableCell>
                  <TableCell>{venta.fechaHora}</TableCell>
                  <TableCell>{venta.cliente}</TableCell>
                  <TableCell>{venta.ruc}</TableCell>
                  <TableCell>{venta.usuario}</TableCell>
                  <TableCell>{venta.tipoVenta}</TableCell>
                  <TableCell align="right">{formatMoneda(venta.total)}</TableCell>
                  <TableCell align="center">
                    <Chip label={venta.estado} color={chipColor(venta.estado)} size="small" variant="outlined" />
                  </TableCell>
                </TableRow>
              ))}
              {ventas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Typography color="text.disabled">
                      {isLoading ? 'Buscando...' : 'Realice una búsqueda para ver los resultados'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── Panel inferior: detalle + controles ── */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>

          {/* Datos de la venta seleccionada */}
          <Box sx={{ minWidth: 240, flex: '0 0 auto' }}>
            {sectionLabel('Datos de la venta')}
            <Grid container spacing={0.5}>
              {[
                ['Nro. Factura:', selectedVenta?.nroFactura ?? '—'],
                ['Fecha/Hora:', selectedVenta?.fechaHora ?? '—'],
                ['Cliente:', selectedVenta?.cliente ?? '—'],
                ['RUC:', selectedVenta?.ruc ?? '—'],
                ['Usuario:', selectedVenta?.usuario ?? '—'],
                ['Sucursal:', selectedVenta?.sucursal ?? '—'],
                ['Tipo / Pago:', selectedVenta ? `${selectedVenta.tipoVenta} / ${selectedVenta.tipoPago}` : '—'],
              ].map(([label, value]) => (
                <React.Fragment key={label}>
                  <Grid size={5}><Typography variant="body2" color="text.secondary">{label}</Typography></Grid>
                  <Grid size={7}><Typography variant="body2">{value}</Typography></Grid>
                </React.Fragment>
              ))}
              <Grid size={5}><Typography variant="body2" color="text.secondary">Estado:</Typography></Grid>
              <Grid size={7}>
                {selectedVenta
                  ? <Chip label={selectedVenta.estado} color={chipColor(selectedVenta.estado)} size="small" />
                  : <Typography variant="body2">—</Typography>}
              </Grid>
              <Grid size={5}><Typography variant="body2" color="text.secondary" fontWeight={600}>Total:</Typography></Grid>
              <Grid size={7}>
                <Typography variant="body1" fontWeight={700} color="primary.main">
                  {selectedVenta ? formatMoneda(selectedVenta.total) : '—'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Detalle de ítems */}
          <Box sx={{ flex: 1, minWidth: 320 }}>
            {sectionLabel('Detalle de ítems')}
            <TableContainer sx={{ maxHeight: 180 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 0.5 }}>Nro</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 0.5 }}>Código</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 0.5 }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 0.5 }} align="right">Cant.</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 0.5 }} align="right">Precio</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 0.5 }} align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detalles.map((d) => (
                    <TableRow key={d.nro}>
                      <TableCell>{d.nro}</TableCell>
                      <TableCell>{typeof d.codigo === 'string' ? d.codigo : (d as any).idProducto}</TableCell>
                      <TableCell>{d.descripcion}</TableCell>
                      <TableCell align="right">{d.cantidad}</TableCell>
                      <TableCell align="right">{formatMoneda(d.precio)}</TableCell>
                      <TableCell align="right">{formatMoneda(d.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                  {detalles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.disabled">
                          {selectedVenta ? 'Sin ítems' : 'Seleccione una venta'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Liquidación de IVA */}
            {detalles.length > 0 && (
              <Stack direction="row" spacing={2} sx={{ mt: 1, justifyContent: 'flex-end' }}>
                <Typography variant="caption" color="text.secondary">
                  Exenta: <strong>{formatMoneda(exentaTotal)}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  IVA 5%: <strong>{formatMoneda(iva5Total)}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  IVA 10%: <strong>{formatMoneda(iva10Total)}</strong>
                </Typography>
                <Typography variant="caption" color="primary.main" fontWeight={700}>
                  Total: {formatMoneda(totalDetalle)}
                </Typography>
              </Stack>
            )}
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Controles */}
          <Box sx={{ minWidth: 140 }}>
            {sectionLabel('Controles')}

            {/* Navegación */}
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
              <Tooltip title="Primero"><span>
                <IconButton size="small" onClick={navPrimero} disabled={ventas.length === 0}>
                  <FirstPageIcon />
                </IconButton>
              </span></Tooltip>
              <Tooltip title="Anterior"><span>
                <IconButton size="small" onClick={navAnterior} disabled={currentIndex <= 0}>
                  <NavigateBeforeIcon />
                </IconButton>
              </span></Tooltip>
              <Tooltip title="Siguiente"><span>
                <IconButton size="small" onClick={navSiguiente} disabled={currentIndex >= ventas.length - 1}>
                  <NavigateNextIcon />
                </IconButton>
              </span></Tooltip>
              <Tooltip title="Último"><span>
                <IconButton size="small" onClick={navUltimo} disabled={ventas.length === 0}>
                  <LastPageIcon />
                </IconButton>
              </span></Tooltip>
            </Box>

            {ventas.length > 0 && currentIndex >= 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Registro {currentIndex + 1} de {ventas.length}
              </Typography>
            )}

            {/* Acciones */}
            <Stack spacing={1}>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                size="small"
                disabled={!selectedVenta}
                fullWidth
                onClick={() => {
                  // TODO: Conectar con el servicio de impresión
                }}
              >
                Imprimir
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<BlockIcon />}
                size="small"
                disabled={!selectedVenta || selectedVenta?.estado === 'ANULADO'}
                fullWidth
                onClick={() => {
                  // TODO: Conectar con sp_anularFacturacion
                }}
              >
                Anular
              </Button>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ConsultaVentas;

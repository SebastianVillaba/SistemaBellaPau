import { useState, useEffect } from 'react';
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
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import TextField from '../components/UppercaseTextField';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import type { ItemFactura, Cliente } from '../types/factura.types';
import type { Caja } from '../types/caja.types';
import { ventaService } from '../services/venta.service';
import { reporteService } from '../services/reporte.service';
import facturaService, { ticketService } from '../services/ticket.service';
import { productoService } from '../services/producto.service';
import type { DatosFactura, DatosTicket } from '../types/ticket.types';
import SearchProductModal from '../components/SearchProductModal';
import ClienteForm from '../components/ClienteForm';
import CajaSelectorModal from '../components/CajaSelectorModal';
import PagoModal from '../components/PagoModal';
import TipoComprobanteModal from '../components/TipoComprobanteModal';
import GastoModal from '../components/GastoModal';
import { useTerminal } from '../hooks/useTerminal';
import SearchClienteModal from '../components/SearchClienteModal';
import RequirePermission from '../components/RequirePermission';

const Facturacion: React.FC = () => {
  // Obtener información de la terminal
  const { idTerminalWeb } = useTerminal();
  const [numeroFactura, setNumeroFactura] = useState<string | undefined>();
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [condicion, setCondicion] = useState<'CONTADO' | 'CREDITO'>('CONTADO');
  const [items, setItems] = useState<ItemFactura[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // TODO: Obtener idUsuario del contexto de autenticación
  const idUsuario = 1; // Temporal - reemplazar con usuario autenticado

  // Estados para búsqueda
  const [clientesOptions, setClientesOptions] = useState<Cliente[]>([]);
  const [productosOptions, setProductosOptions] = useState<ItemFactura[]>([]);
  const [termino, setTermino] = useState('');
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [cantidadProducto, setCantidadProducto] = useState(1);

  // Dialog para agregar producto
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ItemFactura | null>(null);
  const [cantidad, setCantidad] = useState(1);

  // Modal de cliente
  const [openClienteModal, setOpenClienteModal] = useState(false);

  // Modal de caja
  const [openCajaSelector, setOpenCajaSelector] = useState(false);
  const [cajaSeleccionada, setCajaSeleccionada] = useState<Caja | null>(null);

  // Modales de pago y tipo de comprobante
  const [openPagoModal, setOpenPagoModal] = useState(false);
  const [openTipoComprobanteModal, setOpenTipoComprobanteModal] = useState(false);

  // Modal de gastos
  const [openGastoModal, setOpenGastoModal] = useState(false);

  // Calcular totales
  const calcularTotales = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const descuentoTotal = items.reduce((sum, item) => sum + (item.descuento || 0), 0);
    const iva5Total = items.reduce((sum, item) => sum + (item.iva5 || 0), 0);
    const iva10Total = items.reduce((sum, item) => sum + (item.iva10 || 0), 0);
    const ivaTotal = iva5Total + iva10Total;
    const total = subtotal - descuentoTotal;
    return { subtotal, descuentoTotal, total, iva5Total, iva10Total, ivaTotal };
  };

  const { subtotal, descuentoTotal, total, iva5Total, iva10Total, ivaTotal } = calcularTotales();

  // Atajo de teclado F4 para terminar venta y F2 para buscar clientes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F4') {
        event.preventDefault();
        if (items.length > 0) {
          handleTerminarVenta();
        }
      }
      if (event.key === 'F2') {
        event.preventDefault();
        setOpenClienteModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items]);

  // Handlers para búsqueda de productos usando sp_consultaPrecioProducto
  const handleBuscarProductos = async (busqueda: string) => {
    if (!busqueda || busqueda.length < 1) {
      return;
    }

    try {
      // Buscar productos primero
      const results = await productoService.consultarPrecioProducto(busqueda, idTerminalWeb);

      if (results.length === 1) {
        // Si hay un solo resultado, agregarlo directamente
        await handleAgregarDesdeResultado(results[0]);
      } else if (results.length > 1) {
        // Si hay más de un resultado, abrir el modal
        setOpenSearchModal(true);
      } else {
        // Si no hay resultados
        setError('No se encontraron productos con ese criterio');
      }
    } catch (error: any) {
      console.error('Error al buscar productos:', error);
      setError(error.message || 'Error al buscar productos');
    }
  };

  // Manejar búsqueda al presionar Enter y shortcut de cantidad
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      // Verificar si el término empieza con + para establecer cantidad
      if (termino.startsWith('+')) {
        const cantidad = parseFloat(termino.substring(1));
        if (!isNaN(cantidad) && cantidad > 0) {
          setCantidadProducto(cantidad);
          setTermino('');
          return;
        }
      }
      handleBuscarProductos(termino);
    }
  };

  // Cargar items desde detVentaTmp
  const cargarDetalleVenta = async () => {
    if (!idTerminalWeb) return;

    setIsLoadingItems(true);
    try {
      const detalles = await ventaService.consultarDetalleVenta(idTerminalWeb, idUsuario);
      console.log(detalles);

      const itemsFormateados: ItemFactura[] = detalles.map(det => {

        return {
          idDetVentaTmp: det.idDetVentaTmp,
          nro: 0,
          idProducto: det.idProducto,
          nombreMercaderia: det.nombreMercaderia,
          descripcion: det.nombreMercaderia,
          origen: det.origen,
          unidades: det.cantidad,
          precioUnitario: det.precioUnitario,
          descuento: det.precioDescuento,
          subtotal: det.subtotal,
          gravada10: det.gravada10,
          gravada5: det.gravada5,
          exenta: det.exenta,
          iva10: det.iva10,
          iva5: det.iva5,
          ivaTotal: (det.iva5 || 0) + (det.iva10 || 0),
          precio: det.precioUnitario
        };
      });

      setItems(itemsFormateados);
    } catch (error: any) {
      console.error('Error al cargar detalle de venta:', error);
      setError(error.message || 'Error al cargar productos');
    } finally {
      setIsLoadingItems(false);
    }
  };

  // Cargar items y número de factura al montar el componente
  useEffect(() => {
    cargarDetalleVenta();

    // Cargar número de factura inicial
    const cargarNumeroFactura = async () => {
      if (!idTerminalWeb) return;

      try {
        const facturaData = await ventaService.consultaFacturaCorrelativa(idTerminalWeb);
        if (facturaData && facturaData.length > 0) {
          const nroFactura = facturaData[0].nroFacturaFormateado;
          setNumeroFactura(nroFactura?.toString());
        }
      } catch (error: any) {
        console.error('Error al cargar número de factura:', error);
      }
    };

    cargarNumeroFactura();
  }, [idTerminalWeb]);

  // Agregar producto desde los resultados de búsqueda
  const handleAgregarDesdeResultado = async (producto: any) => {
    if (!idTerminalWeb) {
      setError('No hay terminal configurada');
      return;
    }

    try {
      // Agregar a la BD
      await ventaService.agregarDetalleVenta({
        idTerminalWeb,
        idUsuario,
        idProducto: producto.idProducto,
        idStock: producto.idStock || 1,
        cantidad: cantidadProducto,
        precioUnitario: producto.precio,
        precioDescuento: 0
      });

      // Recargar la lista
      await cargarDetalleVenta();

      setTermino('');
      setCantidadProducto(1);
    } catch (error: any) {
      console.error('Error al agregar producto:', error);
      setError(error.message || 'Error al agregar producto');
    }
  };

  // Eliminar producto de la factura
  const handleEliminarItem = async (index: number) => {
    const item = items[index];

    if (!item.idDetVentaTmp) {
      // Si no tiene idDetVentaTmp, solo eliminar del estado local
      setItems(items.filter((_, i) => i !== index));
      return;
    }

    if (!idTerminalWeb) {
      setError('No hay terminal configurada');
      return;
    }

    try {
      // Eliminar de la BD
      await ventaService.eliminarDetalleVenta(idTerminalWeb, item.idDetVentaTmp);

      // Recargar la lista
      await cargarDetalleVenta();

    } catch (error: any) {
      console.error('Error al eliminar producto:', error);
      setError(error.message || 'Error al eliminar producto');
    }
  };

  // Iniciar proceso de terminar venta
  const handleTerminarVenta = () => {
    setError('');
    setSuccess('');

    // Validaciones
    if (items.length === 0) {
      setError('Debe agregar al menos un producto');
      return;
    }

    // Abrir modal de pago
    setOpenPagoModal(true);
  };

  // Cuando se confirma el pago, abrir modal de tipo de comprobante
  const handleConfirmarPago = () => {
    setOpenPagoModal(false);
    setOpenTipoComprobanteModal(true);
  };

  // Guardar venta según el tipo de comprobante seleccionado
  const handleGuardarVenta = async (esTicket: boolean) => {
    setOpenTipoComprobanteModal(false);

    try {
      const { total, descuentoTotal } = calcularTotales();
      const idMovimientoCaja = localStorage.getItem('idMovimientoCaja');
      const idUsuario = localStorage.getItem('idUsuario') || '1';

      if (!idMovimientoCaja) {
        setError('Debe abrir una caja antes de realizar una venta');
        return;
      }

      const ventaData = {
        idUsuarioAlta: parseInt(idUsuario),
        idTerminalWeb: idTerminalWeb,
        idPersonaJur: 1, // TODO: Obtener de la configuración
        idMovimientoCaja: parseInt(idMovimientoCaja),
        idTipoPago: 1, // TODO: Obtener del formulario
        idTipoVenta: 1, // TODO: Obtener del formulario
        idCliente: cliente?.idCliente || 8, // 8 = Cliente SIN NOMBRE
        ruc: cliente?.documento || 'XXXXXXX',
        nombreCliente: cliente?.nombre || 'SIN NOMBRE',
        totalVenta: total,
        totalDescuento: descuentoTotal,
        ticket: esTicket ? 1 : 0
      };

      console.log('Venta a guardar:', ventaData);

      const response = await ventaService.guardarVenta(ventaData);

      if (response.success) {
        setSuccess(`${esTicket ? 'Ticket' : 'Factura'} guardada exitosamente`);

        // Generar e imprimir comprobante según el tipo seleccionado
        if (response.idVenta) {
          try {
            if (esTicket) {
              // Generar ticket simple
              const datosReporte = await reporteService.obtenerDatosTicket(response.idVenta);

              const datosTicketSimple: DatosTicket = {
                // Datos de la empresa
                nombreFantasia: datosReporte.cabecera.nombreFantasia,
                ruc: datosReporte.cabecera.ruc,
                nombreSucursal: datosReporte.cabecera.nombreSucursal,
                nombreTipoPago: datosReporte.cabecera.nombreTipoPago,

                // Datos de la venta
                fechaHora: new Date(datosReporte.cabecera.fechaHora),
                idVenta: response.idVenta,
                total: datosReporte.cabecera.total,

                // Datos del cliente
                cliente: datosReporte.cabecera.cliente,
                rucCliente: datosReporte.cabecera.rucCliente,

                // Información adicional
                vendedor: datosReporte.cabecera.vendedor || 'Sistema',
                totalLetra: datosReporte.cabecera.totalLetra,
                leyenda: datosReporte.cabecera.leyenda,

                // Items
                items: datosReporte.items.map((item: any) => ({
                  cantidad: item.cantidad,
                  codigo: item.codigo,
                  mercaderia: item.mercaderia,
                  precio: item.precio,
                  subtotal: item.subtotal
                }))
              };

              await ticketService.generarTicket(datosTicketSimple);
            } else {
              // Generar factura completa
              const datosReporte = await reporteService.obtenerDatosFactura(response.idVenta);

              const datosFactura: DatosFactura = {
                // Datos de la empresa
                nombreFantasia: datosReporte.cabecera.nombreFantasia,
                empresaContable: datosReporte.cabecera.empresaContable,
                rubro: datosReporte.cabecera.rubro,
                ruc: datosReporte.cabecera.ruc,
                direccion: datosReporte.cabecera.direccionEmpresa,
                telefono: datosReporte.cabecera.telefonoEmpresa,

                // Datos de la venta
                fechaHora: new Date(datosReporte.cabecera.fechaHora),
                nroFactura: `${numeroFactura}`,
                total: datosReporte.cabecera.total,

                // Datos de control fiscal
                timbrado: datosReporte.cabecera.timbrado,
                fechaInicioVigencia: new Date(datosReporte.cabecera.fechaInicioVigencia),
                fechaFinVigencia: new Date(datosReporte.cabecera.fechaFinVigencia),

                // Datos del cliente
                cliente: datosReporte.cabecera.cliente,
                rucCliente: datosReporte.cabecera.rucCliente,
                direccionCliente: cliente?.direccion || '',
                telefonoCliente: cliente?.telefono || '',

                // Información adicional
                vendedor: 'Sistema', // TODO: Obtener del usuario logueado
                tipoFactura: datosReporte.cabecera.tipoFactura,
                formaVenta: datosReporte.cabecera.formaVenta,

                // Liquidación IVA
                gravada10: datosReporte.cabecera.gravada10,
                gravada5: datosReporte.cabecera.gravada5,
                exenta: datosReporte.cabecera.exenta,
                iva10: datosReporte.cabecera.iva10,
                iva5: datosReporte.cabecera.iva5,
                totalIva: datosReporte.cabecera.totalIva,

                // Items
                items: datosReporte.items.map((item: any) => ({
                  cantidad: item.cantidad,
                  codigo: item.codigo,
                  mercaderia: item.mercaderia,
                  precio: item.precio,
                  subtotal: item.subtotal,
                  porcentajeImpuesto: item.porcentajeImpuesto
                }))
              };

              await facturaService.generarTicket(datosFactura);
            }
          } catch (error: any) {
            console.error('Error al generar comprobante:', error);
            setError(`Venta guardada pero hubo un error al generar el ${esTicket ? 'ticket' : 'comprobante de factura'}`);
          }
        }

        // Actualizar número de factura
        try {
          const facturaData = await ventaService.consultaFacturaCorrelativa(idTerminalWeb);
          if (facturaData && facturaData.length > 0) {
            const nroFactura = facturaData[0].nroFacturaFormateado;
            setNumeroFactura(nroFactura?.toString());
          }
        } catch (error: any) {
          console.error('Error al actualizar factura correlativa:', error);
          setError(error?.message || 'Error al consultar la factura correlativa');
        }

        // Limpiar formulario
        setTimeout(() => {
          handleNuevaFactura();
        }, 2000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al guardar la venta');
    }
  };

  // Mantener la función original por compatibilidad
  const handleGuardarFactura = handleTerminarVenta;

  // Nueva factura
  const handleNuevaFactura = async () => {
    setCliente(null);
    setItems([]);
    setError('');
    setSuccess('');
    // Incrementar número de factura
    try {
      const facturaData = await ventaService.consultaFacturaCorrelativa(idTerminalWeb);
      if (facturaData && facturaData.length > 0) {
        const nroFactura = facturaData[0].nroFacturaFormateado;
        setNumeroFactura(nroFactura?.toString());
      }
    } catch (error: any) {
      console.error('Error al consultar la factura correlativa:', error);
      setError(error.message || 'Error al consultar la factura correlativa');
      return;
    }
  };

  // Handler para cuando se selecciona un cliente en el modal
  const handleClienteSelected = (clienteData: any) => {
    // Validar que el cliente tenga un ID válido
    if (!clienteData.idCliente || clienteData.idCliente === 0) {
      setError('El cliente seleccionado no tiene un ID válido');
      return;
    }

    const nuevoCliente: Cliente = {
      idCliente: clienteData.idCliente,
      nombre: clienteData.nombreCliente,
      direccion: clienteData.direccion || '',
      telefono: clienteData.celular || '',
      documento: clienteData.ruc || '',
      dv: clienteData.dv || ''
    };
    setCliente(nuevoCliente);
    setSuccess('Cliente seleccionado correctamente');
  };

  return (
    <RequirePermission permission="ACCESO_VENTAS">
      <Box sx={{ height: 'calc(100vh - 120px)' }}>
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Paper sx={{ p: 2, mb: 2, width: '120vh' }}>
            <Grid container spacing={4}>
              <Grid xs={6}>
                <Stack spacing={1}>
                  <div>
                    <TextField
                      label="RUC"
                      size='small'
                      value={cliente?.documento || ''}
                      InputProps={{ readOnly: true }}
                      sx={{
                        width: '16vh'
                      }}
                    />
                    <TextField
                      label="dv"
                      size='small'
                      value={cliente?.dv || ''}
                      InputProps={{ readOnly: true }}
                      sx={{
                        width: '8vh'
                      }}
                    />
                  </div>
                  <TextField
                    label="Nombre"
                    size="small"
                    value={cliente?.nombre || ''}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Direccion"
                    size='small'
                    value={cliente?.direccion || ''}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    label="Telefono"
                    size='small'
                    value={cliente?.telefono || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Stack>
              </Grid>

              <Grid xs={3}>
                <Stack spacing={1}>
                  <TextField
                    fullWidth
                    label="Fecha"
                    size="small"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <div style={{ display: 'flex', gap: '1vh' }}>
                    <Button
                      variant='contained'
                      sx={{
                        width: '10vh'
                      }}
                      onClick={() => setOpenClienteModal(true)}
                      title="Buscar/Agregar Cliente (F2)"
                    >
                      <PersonSearchIcon />
                    </Button>
                  </div>
                </Stack>
              </Grid>
              <Grid xs={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Condición</InputLabel>
                  <Select
                    value={condicion}
                    label="Condición"
                    onChange={(e) => setCondicion(e.target.value as 'CONTADO' | 'CREDITO')}
                  >
                    <MenuItem value="CONTADO">Contado</MenuItem>
                    <MenuItem value="CREDITO">Credito</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 2, mb: 2, minHeight: '18vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Typography variant='h2'>₲</Typography>
              <Typography
                variant='h3'
                sx={{
                  backgroundColor: "#2dfc61",
                  color: "black",
                  padding: '4px 8px',
                  borderRadius: '5px',
                  border: '1.5px solid #000',
                  mx: 1,
                  minWidth: '25vh',
                  maxWidth: '100%',
                  textAlign: 'center',
                  wordBreak: 'break-word'
                }}
              >{total.toLocaleString()}</Typography>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '12px'
            }}>
              <Typography
                sx={{
                  fontWeight: 'bold',
                  fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                  backgroundColor: '#f5f5f5',
                  padding: '6px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  letterSpacing: '1px',
                  textAlign: 'center',
                  wordBreak: 'break-all',
                  maxWidth: '100%'
                }}
                variant='h5'
              >{numeroFactura}</Typography>
            </div>
          </Paper>
        </div>

        {/* Mensajes */}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => {
          setSuccess('');
          setCliente(null);
        }}>{success}</Alert>}

        {/* Tabla de productos */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', mb: 2, gap: 1, alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                label="Cantidad/Kg"
                size="small"
                type="number"
                value={cantidadProducto}
                onChange={(e) => {
                  const valor = parseFloat(e.target.value);
                  setCantidadProducto(isNaN(valor) || valor <= 0 ? 1 : valor);
                }}
                sx={{ width: '120px' }}
                inputProps={{ min: 0.001, step: 0.001 }}
              />
            </Box>
            <TextField
              fullWidth
              label="Buscar producto (código, código de barra o nombre)"
              size="small"
              value={termino}
              onChange={(e) => setTermino(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Ingrese nombre o código del producto"
              helperText="Tip: Escribe +1.5 y Enter para 1.5kg o +2 para 2 unidades"
            />
            <Button
              variant="contained"
              onClick={() => setOpenSearchModal(true)}
              startIcon={<SearchIcon />}
            >
              Buscar
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Origen</TableCell>
                  <TableCell align="center">Cantidad</TableCell>
                  <TableCell align="right">Precio Unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="right">Descuento</TableCell>
                  <TableCell align="right">Prec. Descuento</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.descripcion || item.nombreMercaderia}</TableCell>
                    <TableCell>{item.origen === 'N' ? 'Nacional' : 'Importado'}</TableCell>
                    <TableCell align='center'>{item.unidades}</TableCell>
                    <TableCell align="right">₲{(item.precioUnitario || item.precio || 0).toLocaleString()}</TableCell>
                    <TableCell align="right">₲{(item.subtotal || 0).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      {item.descuento}
                    </TableCell>
                    <TableCell align="right">₲{((item.subtotal || 0) - (item.descuento || 0)).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="error" onClick={() => handleEliminarItem(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No hay productos agregados, ingresa el codigo o nombre de un producto para comenzar.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Totales y acciones */}
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={1}>
                    <Grid xs={6}>
                      <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="body1" align="right">₲{subtotal.toLocaleString()}</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="body2" color="text.secondary">Descuento:</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="body1" align="right" color="error">-₲{descuentoTotal.toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid xs={12} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={1}>
                    <Grid xs={6}>
                      <Typography variant="body2" color="text.secondary">IVA 5%:</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="body1" align="right">₲{iva5Total.toLocaleString()}</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="body2" color="text.secondary">IVA 10%:</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="body1" align="right">₲{iva10Total.toLocaleString()}</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="h6">Total IVA:</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography variant="h6" align="right" color="primary">₲{ivaTotal.toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SaveIcon />}
                  onClick={handleGuardarFactura}
                  disabled={items.length === 0}
                  size="large"
                >
                  Terminar Venta (F4)
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Modal de búsqueda de productos */}
        <SearchProductModal
          open={openSearchModal}
          onClose={() => setOpenSearchModal(false)}
          idTerminalWeb={idTerminalWeb}
          onSelectProduct={handleAgregarDesdeResultado}
          busqueda={termino}
        />

        {/* Modal de búsqueda de cliente */}
        <SearchClienteModal
          open={openClienteModal}
          onClose={() => setOpenClienteModal(false)}
          onClienteSelected={handleClienteSelected}
        />

        {/* Modal de selección de caja */}
        <CajaSelectorModal
          open={openCajaSelector}
          onClose={() => setOpenCajaSelector(false)}
          onSelectCaja={(caja) => setCajaSeleccionada(caja)}
        />

        {/* Modal de pago */}
        <PagoModal
          open={openPagoModal}
          totalVenta={total}
          onClose={() => setOpenPagoModal(false)}
          onConfirm={handleConfirmarPago}
        />

        {/* Modal de selección de tipo de comprobante */}
        <TipoComprobanteModal
          open={openTipoComprobanteModal}
          onClose={() => setOpenTipoComprobanteModal(false)}
          onSelectTipo={handleGuardarVenta}
        />  
      </Box>
    </RequirePermission>
  );
};

export default Facturacion;
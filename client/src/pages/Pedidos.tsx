import { useState, useEffect, useCallback, useRef } from 'react';
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
  Checkbox,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import TextField from '../components/UppercaseTextField';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SearchIcon from '@mui/icons-material/Search';
import SearchClienteModal from '../components/SearchClienteModal';
import SearchProductModal from '../components/SearchProductModal';
import type { ProductoResultado } from '../components/SearchProductModal';
import { useTerminal } from '../hooks/useTerminal';
import { pedidoService } from '../services/pedido.service';
import { reporteService } from '../services/reporte.service';
import type { DetallePedido, PedidoFiltrado } from '../services/pedido.service'
import type { Cliente } from '../types/pedido.types';
import type { DatosTicketPedido, ItemTicketPedido } from '../types/ticket.types';
import { ticketService } from '../services/ticket.service';
import RequirePermission from '../components/RequirePermission';
import { deliveryService } from '../services/delivery.service';
import type { TipoCobro } from '../services/pedido.service';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';

const Pedidos: React.FC = () => {
  // Estados principales
  const { idTerminalWeb } = useTerminal();
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [cliente, setCliente] = useState<Cliente>({
    nombre: '',
    direccion: '',
    telefono: '',
    documento: '',
    dv: '',
  });
  // Listas para los selects
  const [deliveryList, setDeliveryList] = useState<any[]>([]);
  const [tipoCobroList, setTipoCobroList] = useState<TipoCobro[]>([]);
  // Valores seleccionados
  const [deliverySeleccionado, setDeliverySeleccionado] = useState<number | ''>('');
  const [tipoCobroSeleccionado, setTipoCobroSeleccionado] = useState<number | ''>('');
  const [items, setItems] = useState<DetallePedido[]>([]);
  const [nroPedido, setNroPedido] = useState('');
  const [observacion, setObservacion] = useState('');
  const [idPedidoExistente, setIdPedidoExistente] = useState(0);

  // Estados para búsqueda de productos
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [openProductModal, setOpenProductModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoResultado | null>(null);
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState<number>(1);
  const navigate = useNavigate();

  // Refs para manejo de foco
  const cantidadInputRef = useRef<HTMLInputElement>(null);
  const agregarButtonRef = useRef<HTMLButtonElement>(null);
  const busquedaProductoRef = useRef<HTMLInputElement>(null);
  // Refs para flujo de foco
  const deliverySelectRef = useRef<HTMLSelectElement>(null);
  const tipoCobroSelectRef = useRef<HTMLSelectElement>(null);
  const guardarButtonRef = useRef<HTMLButtonElement>(null);
  const nuevoButtonRef = useRef<HTMLButtonElement>(null);

  // Estados para la lista de pedidos filtrados
  const [pedidosFiltrados, setPedidosFiltrados] = useState<PedidoFiltrado[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoFiltrado | null>(null);
  // Set de idPedido marcados para facturación masiva (refleja detPedidoFacturacionTmp en BD)
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState<Set<number>>(new Set());

  // Estados para los filtros de búsqueda
  const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().split('T')[0]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroTipoCobro, setFiltroTipoCobro] = useState<number | ''>(0);
  const [filtroEstadoCobro, setFiltroEstadoCobro] = useState<'TODOS' | 'PENDIENTE' | 'PAGADO'>('TODOS');

  // Modal de búsqueda de cliente
  const [openClienteModal, setOpenClienteModal] = useState(false);

  // Consulta detalle del pedido (Para que se cargue al añadir un producto)
  const consultarDetalle = useCallback(async () => {
    if (idTerminalWeb) {
      try {
        const data = await pedidoService.consultarDetallePedido(idTerminalWeb);
        console.log(data);
        
        setItems(data);
      } catch (error) {
        console.error(error);
      }
    }
  }, [idTerminalWeb]);

  const consultarTipoCobro = useCallback(async () => {
    try {
      const result = await pedidoService.consultaTipoCobro();
      setTipoCobroList(result);
    } catch (error: any) {
      console.error(error);
    }
  }, []);

  const consultarDelivery = useCallback(async () => {
    try {
      const result = await deliveryService.getDeliveryActivo();
      setDeliveryList(result);
    } catch (error: any) {
      console.error(error);
    }
  }, []);

  const limpiarDetalle = useCallback(async () => {
    if (!idTerminalWeb) return;
    try {
      await pedidoService.limpiarDetPedidoTmp(idTerminalWeb);
    } catch (error: any) {
      console.error(error);
    }
  }, [idTerminalWeb]);

  useEffect(() => {
    consultarDetalle();
  }, [consultarDetalle]);

  useEffect(() => {
    consultarDelivery();
  }, [consultarDelivery]);

  useEffect(() => {
    consultarTipoCobro();
  }, [consultarTipoCobro])

  // Calcular totales
  const calcularTotales = () => {
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    return { total };
  };

  const totales = calcularTotales();

  // Handlers
  const handleNuevo = useCallback(() => {
    setNroPedido('');
    setCliente({
      nombre: '',
      direccion: '',
      telefono: '',
      documento: '',
      dv: '',
    });
    setItems([]);
    setDeliverySeleccionado('');
    setTipoCobroSeleccionado('');
    setTerminoBusqueda('');
    setPedidoSeleccionado(null);
    setProductoSeleccionado(null);
    setCantidadSeleccionada(1);
    setObservacion('');
    setIdPedidoExistente(0);
    limpiarDetalle();
    // Mover foco al campo de búsqueda de productos
    setTimeout(() => busquedaProductoRef.current?.focus(), 100);
  }, [limpiarDetalle]);

  // Buscar por fecha (al presionar Enter en el campo fecha)
  const handleBuscarPorFecha = useCallback(async () => {
    if (!filtroFecha) return;
    try {
      const data = await pedidoService.consultarPedidosPorFecha(filtroFecha);
      setPedidosFiltrados(data);
      setPedidoSeleccionado(null);
    } catch (error) {
      console.error(error);
    }
  }, [filtroFecha]);

  // Buscar con filtros (nombre, tipo cobro, estado)
  const handleBuscarConFiltros = useCallback(async () => {
    if (!filtroTipoCobro && filtroTipoCobro !== 0) return;
    const habilitarEstado = filtroEstadoCobro !== 'TODOS';
    const estadoCobro = filtroEstadoCobro === 'PENDIENTE' ? true : filtroEstadoCobro === 'PAGADO' ? false : null;
    try {
      const data = await pedidoService.consultarPedidosFiltro(
        filtroNombre,
        filtroTipoCobro as number,
        habilitarEstado,
        estadoCobro
      );
      console.log(data);
      setPedidosFiltrados(data);
      setPedidoSeleccionado(null);
    } catch (error) {
      console.error(error);
    }
  }, [filtroNombre, filtroTipoCobro, filtroEstadoCobro]);

  // Función genérica para refrescar pedidos (usada después de facturar)
  const handleBuscarPedidos = useCallback(async () => {
    // Re-ejecutar la última búsqueda para refrescar la grilla
    if (filtroNombre || (filtroTipoCobro && filtroTipoCobro !== 0)) {
      await handleBuscarConFiltros();
    } else if (filtroFecha) {
      await handleBuscarPorFecha();
    }
  }, [handleBuscarConFiltros, handleBuscarPorFecha, filtroNombre, filtroTipoCobro, filtroFecha]);

  const handleSeleccionarPedido = async (pedido: PedidoFiltrado) => {
    setPedidoSeleccionado(pedido);

    if (!idTerminalWeb || !pedido.idPedido) return;

    try {
      const datos = await pedidoService.obtenerDatosPedido(pedido.idPedido, idTerminalWeb);
      if (datos) {
        setIdPedidoExistente(datos.idPedido);
        setCliente({
          idCliente: datos.idCliente,
          nombre: datos.nombreCliente || '',
          direccion: datos.direccion || '',
          telefono: datos.celular || '',
          documento: datos.ruc || '',
          dv: datos.dv || '',
        });
        setDeliverySeleccionado(datos.idDelivery || '');
        setTipoCobroSeleccionado(datos.idTipoCobro || '');
        setObservacion(datos.observacion || '');
        if (datos.fechaEntrega) {
          setFecha(datos.fechaEntrega.split('T')[0]);
        }
        // El SP ya cargó los items en la tabla temporal, refrescar
        await consultarDetalle();
      }
    } catch (error) {
      console.error('Error al cargar datos del pedido:', error);
      alert('No se pudieron cargar los datos del pedido');
    }
  };


  // Funcion para guardar el pedido 
  const handleGuardar = useCallback(async () => {
    // Pregunto si es que tengo un cliente o una terminal asignados
    if (!idTerminalWeb || !cliente.idCliente) {
      alert('Debe seleccionar un cliente y tener una terminal asignada.');
      return;
    }
    const pedido = {
      idUsuarioAlta: 1, // TODO: get from auth
      idTerminalWeb,
      idPedidoExistente,
      idTipoCobro: tipoCobroSeleccionado as number,
      idCliente: cliente.idCliente,
      idDelivery: deliverySeleccionado as number,
      direccion: cliente.direccion || '',
      fechaEntrega: fecha,
      observacion,
    };
    try {
      await pedidoService.guardarPedido(pedido);
      alert('Pedido guardado correctamente');
      handleNuevo();
      handleBuscarPedidos();
      // Mover foco al botón Nuevo
      setTimeout(() => nuevoButtonRef.current?.focus(), 100);
    } catch (error) {
      console.error(error);
      alert('Error al guardar el pedido');
    }
  }, [idTerminalWeb, cliente, tipoCobroSeleccionado, deliverySeleccionado, idPedidoExistente, fecha, observacion, handleNuevo, handleBuscarPedidos]);

  // Atajos de teclado F1-F4
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'F1':
          event.preventDefault();
          setOpenProductModal(true);
          break;
        case 'F2':
          event.preventDefault();
          setOpenClienteModal(true);
          break;
        case 'F3':
          event.preventDefault();
          handleNuevo();
          break;
        case 'F4':
          event.preventDefault();
          handleGuardar();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNuevo, handleGuardar]);

  const handleImprimir = async () => {
    if (!pedidoSeleccionado || !pedidoSeleccionado.idPedido) {
      alert('Seleccione un pedido del listado para imprimir.');
      return;
    }

    try {
      const reporte = await reporteService.obtenerDatosTicketPedido(
        pedidoSeleccionado.idPedido,
        pedidoSeleccionado.Nro
      );

      if (!reporte?.cabecera) {
        alert('No se encontró información para el pedido seleccionado.');
        return;
      }

      const items: ItemTicketPedido[] = (reporte.items || []).map((item: any) => ({
        cantidad: Number(item.cantidad) || 0,
        mercaderia: item.mercaderia || '',
        precio: Number(item.precio) || 0,
        subtotal: Number(item.subtotal) || 0,
        codigo: item.codigo || ''
      }));

      const datosTicket: DatosTicketPedido = {
        numeroPedido: reporte.cabecera.nro ?? pedidoSeleccionado.Nro,
        cliente: reporte.cabecera.nombreCliente || '',
        direccion: reporte.cabecera.direccion || '',
        celular: reporte.cabecera.celular || '',
        fechaHora: reporte.cabecera.fechaHora || new Date().toISOString(),
        delivery: reporte.cabecera.nombreDelivery || '',
        items,
        total: items.reduce((sum: number, item) => sum + item.subtotal, 0)
      };

      await ticketService.generarTicketPedido(datosTicket);
    } catch (error) {
      console.error('Error al generar ticket del pedido:', error);
      alert('No se pudo generar el ticket del pedido.');
    }
  };

  const handleImprimirPedidosDia = async () => {
    try {
      const pedidos = await pedidoService.consultarPedidosDia();
      if (!pedidos || pedidos.length === 0) {
        alert('No hay pedidos para el día actual.');
        return;
      }

      await ticketService.generarTicketPedidosDia({
        fechaImpresion: new Date(),
        items: pedidos
      });
    } catch (error) {
      console.error('Error obteniendo o imprimiendo pedidos del día:', error);
      alert('Ocurrió un error al generar la lista de pedidos del día.');
    }
  };

  // Factura el pedido actualmente seleccionado en la lista
  const handleFacturarPedido = async () => {
    if (!pedidoSeleccionado || !idTerminalWeb || !pedidoSeleccionado.idPedido) {
      alert('Seleccione un pedido de la lista para facturar.');
      return;
    }
    if (!window.confirm(`¿Desea enviar el pedido Nro ${pedidoSeleccionado.Nro} a facturación?`)) return;
    try {
      await pedidoService.pedidoClienteFacturacion(pedidoSeleccionado.idPedido, idTerminalWeb);
      alert('Pedido enviado a facturación correctamente.');
      setPedidoSeleccionado(null);
      handleBuscarPedidos();
      navigate('/facturacion');
    } catch (error: any) {
      alert(error.message || 'Error al facturar el pedido.');
    }
  };

  // Factura TODOS los pedidos pendientes del cliente seleccionado
  const handleFacturarPendientesCliente = async () => {
    if (!pedidoSeleccionado?.idPedido || !idTerminalWeb) {
      alert('Seleccione un pedido (de cualquier pedido del cliente) para facturar todos sus pendientes.');
      return;
    }
    try {
      const datos = await pedidoService.obtenerDatosPedido(pedidoSeleccionado.idPedido, idTerminalWeb);
      if (!datos?.idCliente) { alert('No se pudo obtener el cliente del pedido.'); return; }
      if (!window.confirm(`¿Facturar TODOS los pedidos pendientes de ${pedidoSeleccionado.nombreCliente}?`)) return;
      await pedidoService.facturarPedidosPendientesCliente(datos.idCliente, idTerminalWeb);
      alert(`Todos los pedidos pendientes de ${pedidoSeleccionado.nombreCliente} fueron enviados a facturación.`);
      setPedidoSeleccionado(null);
      setPedidosSeleccionados(new Set());
      handleBuscarPedidos();
      navigate('/facturacion');
    } catch (error: any) {
      alert(error.message || 'Error al facturar pendientes del cliente.');
    }
  };

  // Alterna el check de un pedido para facturación masiva
  const handleToggleSeleccionMasiva = async (pedido: PedidoFiltrado, checked: boolean) => {
    if (!idTerminalWeb || !pedido.idPedido) return;
    try {
      if (checked) {
        await pedidoService.agregarDetPedidoFacturacionTmp(idTerminalWeb, pedido.idPedido);
        setPedidosSeleccionados(prev => new Set(prev).add(pedido.idPedido));
      } else {
        await pedidoService.eliminarDetPedidoFacturacionTmp(idTerminalWeb, pedido.idPedido);
        setPedidosSeleccionados(prev => { const s = new Set(prev); s.delete(pedido.idPedido!); return s; });
      }
    } catch (error: any) {
      alert(error.message || 'Error al actualizar selección.');
    }
  };

  // Ejecuta la facturación masiva con los pedidos marcados
  const handleFacturarMasivo = async () => {
    if (!idTerminalWeb || pedidosSeleccionados.size === 0) {
      alert('Marque al menos un pedido con el checkbox para facturar pedidos.');
      return;
    }
    if (!window.confirm(`¿Desea enviar ${pedidosSeleccionados.size} pedido(s) seleccionado(s) a facturación?`)) return;
    try {
      const result = await pedidoService.pedidosClienteMasivoAFacturacion(idTerminalWeb);
      alert(result?.mensaje || 'Facturación completada correctamente.');
      setPedidosSeleccionados(new Set());
      setPedidoSeleccionado(null);
      handleBuscarPedidos();
      navigate('/facturacion');
    } catch (error: any) {
      alert(error.message || 'Error en la facturación de pedidos.');
    }
  };

  const handleBuscarProducto = () => {
    setOpenProductModal(true);
  };

  const handleSelectProduct = (producto: ProductoResultado) => {
    setProductoSeleccionado(producto);
    setCantidadSeleccionada(1);
    // Enfocar y seleccionar el campo de cantidad después de seleccionar un producto
    setTimeout(() => {
      if (cantidadInputRef.current) {
        cantidadInputRef.current.focus();
        cantidadInputRef.current.select();
      }
    }, 100);
  };

  const handleAgregarProducto = async () => {
    if (!idTerminalWeb || !productoSeleccionado) return;

    if (cantidadSeleccionada <= 0) {
      alert('La cantidad debe ser mayor a cero');
      return;
    }

    const data = {
      idTerminalWeb,
      idProducto: productoSeleccionado.idProducto,
      idStock: productoSeleccionado.idStock,
      cantidad: cantidadSeleccionada,
      precio: productoSeleccionado.precio,
    } as const;

    try {
      await pedidoService.agregarDetallePedido(data);
      setProductoSeleccionado(null);
      setCantidadSeleccionada(1);
      consultarDetalle();
      // Volver el foco al campo de búsqueda de productos
      setTimeout(() => {
        if (busquedaProductoRef.current) {
          busquedaProductoRef.current.focus();
        }
      }, 100);
    } catch (error) {
      console.error(error);
      alert('No se pudo agregar el producto al pedido');
    }
  };

  const handleEliminarItem = async (idDetPedidoTmp: number) => {
    if (!idTerminalWeb) {
      alert('No se puede eliminar sin una terminal asignada.');
      return;
    }
    try {
      await pedidoService.eliminarDetallePedido(idTerminalWeb, idDetPedidoTmp);
      consultarDetalle();
    } catch (error) {
      console.error(error);
    }
  };

  // Handler para cuando se selecciona un cliente en el modal
  const handleClienteSelected = (clienteData: any) => {
    const nuevoCliente: Cliente = {
      idCliente: clienteData.idCliente,
      nombre: clienteData.nombreCliente,
      direccion: clienteData.direccion || '',
      telefono: clienteData.celular || '',
      documento: clienteData.ruc || '',
      dv: clienteData.dv || '',
    };
    setCliente(nuevoCliente);
    // Mover foco al select de Delivery
    setTimeout(() => deliverySelectRef.current?.focus(), 100);
  };

  const handleAnularPedido = async () => {
    if (!pedidoSeleccionado || !pedidoSeleccionado.idPedido) {
      alert('Debe seleccionar un pedido para anular');
      return;
    }
    if (!window.confirm(`¿Desea anular el pedido Nro ${pedidoSeleccionado.Nro}?`)) return;
    try {
      await pedidoService.anularPedido(pedidoSeleccionado.idPedido);
      alert('Pedido anulado correctamente');
      setPedidoSeleccionado(null);
      handleNuevo();
      handleBuscarPedidos();
    } catch (error) {
      console.error(error);
      alert('No se pudo anular el pedido');
    }
  };

  return (
    <RequirePermission permission="ACCESO_COMPRAS">
      <Box sx={{ height: 'calc(100vh - 10px)', p: 2, display: 'flex', flexDirection: 'column' }}>
        {/* Botones de Acción */}
        <Grid container spacing={2} sx={{ flexShrink: 0 }}>
          <Grid size={6}>
            <Stack direction="row" spacing={1} sx={{ height: '5vh', mb: 1 }} >
              <Button
                ref={nuevoButtonRef}
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={handleNuevo}
              >
                Nuevo (F3)
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handleImprimir}
                disabled={!pedidoSeleccionado}
              >
                Imprimir
              </Button>
              <Button
                ref={guardarButtonRef}
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleGuardar}
              >
                Guardar (F4)
              </Button>
            </Stack>
          </Grid>
          <Grid size={6}>
            <Stack direction="row" spacing={1} sx={{ height: '5vh', mb: 1 }} >
              <Tooltip title="Factura el pedido seleccionado de la lista">
                <span>
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<ReceiptIcon />}
                    onClick={handleFacturarPedido}
                    disabled={!pedidoSeleccionado}
                  >
                    Facturar Pedido
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Factura todos los pedidos pendientes del cliente del pedido seleccionado">
                <span>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<ReceiptIcon />}
                    onClick={handleFacturarPendientesCliente}
                    disabled={!pedidoSeleccionado}
                  >
                    Pendientes Cliente
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title={`Factura los ${pedidosSeleccionados.size} pedido(s) marcados con checkbox`}>
                <span>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<ReceiptIcon />}
                    onClick={handleFacturarMasivo}
                    disabled={pedidosSeleccionados.size === 0}
                  >
                    Facturar Selec. ({pedidosSeleccionados.size})
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ flexGrow: 1, minHeight: 0 }}>
          {/* Lado Izquierdo - Formulario de Pedido */}
          <Grid size={4} sx={{ height: '100%' }}>
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Búsqueda de Productos */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Productos
                </Typography>
                {/* Stack de busqueda de producto */}
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Buscar producto (F1)"
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleBuscarProducto();
                      }
                    }}
                    inputRef={busquedaProductoRef}
                  />
                  <Button
                    variant="contained"
                    onClick={handleBuscarProducto}
                    startIcon={<SearchIcon />}
                  >
                    Buscar
                  </Button>
                </Stack>

                {/* Detalle del Producto Seleccionado */}
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  {productoSeleccionado ? (
                    <>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1" fontWeight="bold" >
                            {productoSeleccionado.nombreMercaderia}
                          </Typography>
                          <ClearIcon onClick={() => setProductoSeleccionado(null)} sx={{ cursor: 'pointer' }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Código: {productoSeleccionado.codigo}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Precio: {productoSeleccionado.precio.toLocaleString('es-PY')} Gs.
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TextField
                            label="Cantidad"
                            type="number"
                            size="small"
                            value={cantidadSeleccionada}
                            onChange={(e) => setCantidadSeleccionada(Number(e.target.value) || 0)}
                            inputProps={{ min: 0.01, step: 1 }}
                            sx={{ width: 140 }}
                            inputRef={cantidadInputRef}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                agregarButtonRef.current?.focus();
                              }
                            }}
                          />
                          <Button
                            ref={agregarButtonRef}
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleAgregarProducto}
                          >
                            Agregar
                          </Button>
                        </Stack>
                      </Stack>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Seleccione un producto para ver los detalles
                    </Typography>
                  )}
                </Paper>
              </Box>

              {/* Tabla de Items */}
              <Box sx={{ flexGrow: 1, overflow: 'hidden', mb: 2, minHeight: 0 }}>
                <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nro</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell align="right">Unidades</TableCell>
                        <TableCell align="right">Precio</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.idDetPedidoTmp}>
                          <TableCell>{item.nro}</TableCell>
                          <TableCell>{item.nombreMercaderia}</TableCell>
                          <TableCell align="right">{item.cantidad}</TableCell>
                          <TableCell align="right">
                            {item.precioUnitario?.toLocaleString('es-PY')}
                          </TableCell>
                          <TableCell align="right">
                            {item.subtotal.toLocaleString('es-PY')}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleEliminarItem(item.idDetPedidoTmp)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Formulario del Cliente */}
              <Box sx={{ mt: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Datos del Cliente (F2)
                </Typography>
                {/* Formulario del cliente */}
                <Grid container spacing={2}>
                  <Grid size={6}> {/* Lado izquierdo */}
                    <Grid container spacing={1}> {/* Grid para el lado izquierdo */}
                      <Grid size={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="RUC"
                          value={cliente.documento}
                          onChange={(e) =>
                            setCliente({ ...cliente, documento: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid size={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="DV"
                          value={cliente.dv}
                          onChange={(e) => setCliente({ ...cliente, dv: e.target.value })}
                        />
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Nombre"
                          value={cliente.nombre}
                          onChange={(e) =>
                            setCliente({ ...cliente, nombre: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Dirección"
                          value={cliente.direccion}
                          onChange={(e) =>
                            setCliente({ ...cliente, direccion: e.target.value })
                          }
                        />
                      </Grid>
                      <Grid size={8}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Celular"
                          value={cliente.telefono}
                          onChange={(e) =>
                            setCliente({ ...cliente, telefono: e.target.value })
                          }
                        />
                      </Grid>

                    </Grid>
                  </Grid>
                  <Grid size={6}> {/* Lado derecho */}
                    <Grid container spacing={1}>
                      <Grid size={12}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Delivery</InputLabel>
                          <Select
                            inputRef={deliverySelectRef}
                            value={deliverySeleccionado}
                            label="Delivery"
                            onChange={(e) => {
                              setDeliverySeleccionado(e.target.value as number);
                              // Mover foco al select de Tipo de Pago
                              setTimeout(() => tipoCobroSelectRef.current?.focus(), 100);
                            }}
                          >
                            {
                              deliveryList.map((item: any) => (
                                <MenuItem key={item.idDelivery} value={item.idDelivery}>
                                  {item.nombreDelivery}
                                </MenuItem>
                              ))
                            }
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={12}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Tipo de Pago</InputLabel>
                          <Select
                            inputRef={tipoCobroSelectRef}
                            value={tipoCobroSeleccionado}
                            label="Tipo de Pago"
                            onChange={(e) => {
                              setTipoCobroSeleccionado(e.target.value as number);
                              // Mover foco al botón Guardar
                              setTimeout(() => guardarButtonRef.current?.focus(), 100);
                            }}
                          >
                            {
                              tipoCobroList.map((item: TipoCobro) => (
                                <MenuItem key={item.idTipoCobro} value={item.idTipoCobro}>
                                  {item.nombreTipo}
                                </MenuItem>
                              ))
                            }
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid size={10}>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          label="Fecha Entrega"
                          value={fecha}
                          onChange={(e) => setFecha(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid size={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Observación"
                          value={observacion}
                          onChange={(e) => setObservacion(e.target.value)}
                          multiline
                          maxRows={2}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Total */}
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Typography variant="h5" color="error" sx={{ fontWeight: 'bold' }}>
                    Total: {totales.total.toLocaleString('es-PY')} Gs.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Lado Derecho - Lista de Pedidos Filtrados */}
          <Grid size={8} sx={{ height: '100%' }}>
            <Paper sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Filtrar Pedidos
              </Typography>
              {/* Barra de Filtros */}
              <Box sx={{ mb: 1, display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  type="date"
                  label="Fecha Entrega"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleBuscarPorFecha();
                    }
                  }}
                  sx={{ minWidth: 150, width: '120px' }}
                />
                <TextField
                  size="small"
                  label="Cliente"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleBuscarConFiltros();
                    }
                  }}
                  sx={{ width: '200px' }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Tipo Cobro</InputLabel>
                  <Select
                    value={filtroTipoCobro}
                    label="Tipo Cobro"
                    onChange={(e) => setFiltroTipoCobro(e.target.value as number)}
                  >
                    {tipoCobroList.map((item: TipoCobro) => (
                      <MenuItem key={item.idTipoCobro} value={item.idTipoCobro}>
                        {item.nombreTipo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filtroEstadoCobro}
                    label="Estado"
                    onChange={(e) => setFiltroEstadoCobro(e.target.value as 'TODOS' | 'PENDIENTE' | 'PAGADO')}
                  >
                    <MenuItem value="TODOS">TODOS</MenuItem>
                    <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
                    <MenuItem value="PAGADO">PAGADO</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleBuscarConFiltros}
                >
                  Buscar
                </Button>
              </Box>
              {/* Grilla de Pedidos Filtrados */}
              <Box sx={{ flexGrow: 1, overflow: 'hidden', minHeight: 0 }}>
                <TableContainer sx={{ height: '100%', overflow: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5', width: 40, p: '4px 8px' }}>
                          <Tooltip title="Marcar para facturación masiva">
                            <span>✓</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Nro</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Cliente</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Tipo Cobro</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Delivery</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pedidosFiltrados.length > 0 ? (
                        pedidosFiltrados.map((pedido, idx) => (
                          <TableRow
                            key={`${pedido.Nro}-${idx}`}
                            hover
                            selected={pedidoSeleccionado?.Nro === pedido.Nro && pedidoSeleccionado?.nombreCliente === pedido.nombreCliente}
                            sx={{
                              cursor: 'pointer',
                              bgcolor: pedido.idPedido && pedidosSeleccionados.has(pedido.idPedido)
                                ? 'rgba(25,118,210,0.08)'
                                : pedidoSeleccionado?.Nro === pedido.Nro && pedidoSeleccionado?.nombreCliente === pedido.nombreCliente
                                  ? 'action.selected'
                                  : undefined
                            }}
                            onClick={() => handleSeleccionarPedido(pedido)}
                          >
                            {/* Columna checkbox para facturación masiva */}
                            <TableCell sx={{ p: '0 8px' }} onClick={e => e.stopPropagation()}>
                            {
                              pedido.estado === 'PENDIENTE' ? (
                                
                                  <Checkbox
                                    size="small"
                                    checked={!!pedido.idPedido && pedidosSeleccionados.has(pedido.idPedido)}
                                    onChange={(_, checked) => handleToggleSeleccionMasiva(pedido, checked)}
                                    color="primary"
                                  />
                              ) : 
                              (
                                <Checkbox
                                  size="small"
                                  disabled
                                />
                              )
                            }
                            </TableCell>
                            <TableCell>{pedido.fechaEntrega ? (() => { const [y, m, d] = pedido.fechaEntrega.split('T')[0].split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-PY'); })() : ''}</TableCell>
                            <TableCell>{pedido.Nro}</TableCell>
                            <TableCell>{pedido.nombreCliente}</TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: pedido.estado === 'PENDIENTE' ? 'warning.main' : 'success.main'
                                }}
                              >
                                {pedido.estado}
                              </Typography>
                            </TableCell>
                            <TableCell>{pedido.tipoCobro}</TableCell>
                            <TableCell align="right">{pedido.totalPedido?.toLocaleString('es-PY')}</TableCell>
                            <TableCell>{pedido.nombreDelivery}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <Typography variant="body2" color="text.secondary">
                              No hay pedidos para mostrar
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        <Box sx={{ flexShrink: 0, mt: 1, justifyContent: 'space-between', display: 'flex' }}>
          <Stack direction="row" spacing={1}>
            <Button
                    variant="contained"
                    color="info"
                    startIcon={<PrintIcon />}
                    onClick={handleImprimirPedidosDia}
                  >
                    Imprimir Pedidos del Día
            </Button>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleAnularPedido}
              disabled={!pedidoSeleccionado}
            >
                    Anular Pedido
            </Button>
          </Stack>
        </Box>

        {/* Modal de búsqueda de cliente */}
        <SearchClienteModal
          open={openClienteModal}
          onClose={() => setOpenClienteModal(false)}
          onClienteSelected={handleClienteSelected}
        />
        {/* Modal de búsqueda de producto */}
        {idTerminalWeb && (
          <SearchProductModal
            open={openProductModal}
            onClose={() => setOpenProductModal(false)}
            onSelectProduct={handleSelectProduct}
            idTerminalWeb={idTerminalWeb}
            busqueda={terminoBusqueda}
          />
        )}
      </Box>
    </RequirePermission>
  );
};

export default Pedidos;

import React, { useRef, useState } from 'react';
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
    MenuItem
} from '@mui/material';
import TextField from '../components/UppercaseTextField';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { useRemisiones } from '../hooks/useRemisiones';
import SearchProductRemisionModal from '../components/SearchProductRemisionModal';
import type { ProductoRemisionResultado } from '../components/SearchProductRemisionModal';
import ImportarPedidoModal from '../components/ImportarPedidoModal';
import { remisionService } from '../services/remision.service';
import { useTerminal } from '../hooks/useTerminal';
import { reporteService } from '../services/reporte.service';
import { ticketService } from '../services/ticket.service';
import RequirePermission from '../components/RequirePermission';

const Remisiones: React.FC = () => {
    const { idTerminalWeb, idDepositoRemision } = useTerminal();
    const {
        items,
        observacion,
        setObservacion,
        idDepositoDestino,
        setIdDepositoDestino,
        depositos,
        error,
        setError,
        success,
        setSuccess,
        consultarStock,
        agregarDetalle,
        guardarRemision,
        eliminarDetalleRemisionTmp,
        setIdPedidoInterno,
        cargarDetalles
    } = useRemisiones();

    const [busqueda, setBusqueda] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [openSearchModal, setOpenSearchModal] = useState(false);
    const [openImportModal, setOpenImportModal] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoRemisionResultado | null>(null);

    const handleBuscar = async () => {
        if (!busqueda) return;

        try {
            const resultados = await consultarStock(busqueda);
            if (resultados && resultados.length === 1) {
                const producto = resultados[0];
                setProductoSeleccionado(producto);
                setBusqueda(producto.nombreMercaderia);
                cantidadRef.current?.focus();
            } else {
                setOpenSearchModal(true);
            }
        } catch (err) {
            console.error(err);
            setOpenSearchModal(true);
        }
    };

    const handleAgregarProducto = async () => {
        if (!productoSeleccionado) return;
        await agregarDetalle(productoSeleccionado, cantidad);
        setProductoSeleccionado(null);
        setBusqueda('');
        setCantidad(1);
        productoRef.current?.focus();
    }

    const handleProductSelected = (producto: ProductoRemisionResultado) => {
        setProductoSeleccionado(producto);
        setBusqueda(producto.nombreMercaderia);
        cantidadRef.current?.focus();
    };

    const handleImportarPedido = async (idPedido: number) => {
        if (!idTerminalWeb) return;
        try {
            const result = await remisionService.importarPedido(idTerminalWeb, idPedido);
            // El resultado es un array, accedemos al primer elemento
            setSuccess(`Pedido importado correctamente. Items importados: ${result[0].itemsImportados}`);

            // Guardar el ID del pedido importado
            setIdPedidoInterno(idPedido);

            // Recargar detalles usando la función del hook
            await cargarDetalles();

        } catch (err: any) {
            setError(err.message);
        }
    };

    const productoRef = useRef<HTMLInputElement>(null);
    const cantidadRef = useRef<HTMLInputElement>(null);
    const agregarRef = useRef<HTMLButtonElement>(null);

    return (
        <RequirePermission permission="ACCESO_REMISIONES">
            <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
                <Typography variant="h4" gutterBottom>
                    Nueva Remisión
                </Typography>

                {/* Cabecera */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Depósito Destino</InputLabel>
                                <Select
                                    value={idDepositoDestino}
                                    label="Depósito Destino"
                                    onChange={(e) => setIdDepositoDestino(Number(e.target.value))}
                                >
                                    <MenuItem value={0}>Seleccione...</MenuItem>
                                    {depositos.map((dep: any) => (
                                        <MenuItem key={dep.idDeposito} value={dep.idDeposito} disabled={dep.idDeposito === idDepositoRemision}>
                                            {dep.nombreDeposito}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                label="Observación"
                                size="small"
                                value={observacion}
                                onChange={(e) => setObservacion(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                {/* Mensajes */}
                {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

                {/* Buscador */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                            <TextField
                                fullWidth
                                label="Buscar Producto (Código/Nombre)"
                                size="small"
                                value={busqueda}
                                inputRef={productoRef}
                                onChange={(e) => {
                                    setBusqueda(e.target.value);
                                    setProductoSeleccionado(null);
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleBuscar();
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <Button size="small" onClick={handleBuscar} sx={{ minWidth: 'auto', p: 0.5 }}>
                                            <SearchIcon fontSize="small" />
                                        </Button>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                label="Cantidad"
                                type="number"
                                size="small"
                                value={cantidad}
                                inputRef={cantidadRef}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => setCantidad(Number(e.target.value))}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        agregarRef?.current?.focus();
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleAgregarProducto}
                                ref={agregarRef}
                                disabled={!productoSeleccionado}
                            >
                                Agregar
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Tabla Detalle */}
                <TableContainer component={Paper} sx={{ mb: 2, maxHeight: '400px' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nro</TableCell>
                                <TableCell>Código</TableCell>
                                <TableCell>Mercadería</TableCell>
                                <TableCell>Cantidad</TableCell>
                                <TableCell>Precio Un.</TableCell>
                                <TableCell>Subtotal</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.nro}</TableCell>
                                    <TableCell>{item.codigo}</TableCell>
                                    <TableCell>{item.nombreMercaderia}</TableCell>
                                    <TableCell>{item.cantidadEnviada}</TableCell>
                                    <TableCell>{item.costoUnitario}</TableCell>
                                    <TableCell>{item.subtotal}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            onClick={() => eliminarDetalleRemisionTmp(item.idDetRemisionTmp)}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay items agregados
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Footer Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="large"
                        onClick={() => setOpenImportModal(true)}
                    >
                        Importar Pedido Interno
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={async () => {
                            const idRemision = await guardarRemision();
                            if (idRemision) {
                                try {
                                    const data = await reporteService.obtenerTicketRemision(idRemision);
                                    if (data.success) {
                                        const ticketData = {
                                            ...data.cabecera,
                                            items: data.items
                                        };
                                        ticketService.generarTicketRemision(ticketData);
                                    }
                                } catch (error) {
                                    console.error('Error al generar ticket de remisión:', error);
                                    alert('Remisión guardada, pero hubo un error al generar el ticket.');
                                }
                            }
                        }}
                    >
                        Guardar Remisión (F2)
                    </Button>
                </Box>

                {/* Modal de Búsqueda */}
                <SearchProductRemisionModal
                    open={openSearchModal}
                    onClose={() => setOpenSearchModal(false)}
                    idTerminalWeb={idTerminalWeb || 0}
                    onSelectProduct={handleProductSelected}
                    busqueda={busqueda}
                />

                {/* Modal de Importar Pedido */}
                <ImportarPedidoModal
                    open={openImportModal}
                    onClose={() => setOpenImportModal(false)}
                    onImport={handleImportarPedido}
                    idTerminalWeb={idTerminalWeb || 0}
                />
            </Box>
        </RequirePermission>
    );
};

export default Remisiones;

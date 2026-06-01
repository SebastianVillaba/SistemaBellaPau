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
import TextField from '../../components/UppercaseTextField';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { usePedidoInterno } from '../../hooks/usePedidoInterno';
import SearchProductModal from '../../components/SearchProductModal';
import { useTerminal } from '../../hooks/useTerminal';

const GenerarPedidoInterno: React.FC = () => {
    const { idTerminalWeb, idSucursal } = useTerminal();
    console.log(idTerminalWeb, idSucursal);
    const {
        items,
        sucursales,
        idSucursalProveedor,
        setIdSucursalProveedor,
        observacion,
        setObservacion,
        fechaNecesaria,
        setFechaNecesaria,
        error,
        setError,
        success,
        setSuccess,
        agregarDetalle,
        eliminarDetalle,
        guardarPedido
    } = usePedidoInterno();

    const [busqueda, setBusqueda] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [openSearchModal, setOpenSearchModal] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState<any | null>(null);

    const productoRef = useRef<HTMLInputElement>(null);
    const cantidadRef = useRef<HTMLInputElement>(null);
    const agregarRef = useRef<HTMLButtonElement>(null);

    const handleBuscar = () => {
        if (!busqueda) {
            setOpenSearchModal(true);
            return;
        }
        // Si hay texto, abrimos el modal con ese texto para buscar
        setOpenSearchModal(true);
    };

    const handleProductSelected = (producto: any) => {
        setProductoSeleccionado(producto);
        setBusqueda(producto.nombreMercaderia || producto.nombre);
        cantidadRef.current?.focus();
    };

    const handleAgregarProducto = async () => {
        if (!productoSeleccionado) return;
        await agregarDetalle(productoSeleccionado, cantidad);
        setProductoSeleccionado(null);
        setBusqueda('');
        setCantidad(1);
        productoRef.current?.focus();
    };

    // Shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                guardarPedido();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [guardarPedido]);

    return (
        <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
            <Typography variant="h4" gutterBottom>
                Generar Pedido Interno
            </Typography>

            {/* Cabecera */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Sucursal Destino</InputLabel>
                            <Select
                                value={idSucursalProveedor}
                                label="Sucursal Destino"
                                onChange={(e) => setIdSucursalProveedor(Number(e.target.value))}
                            >
                                <MenuItem value={0}>Seleccione...</MenuItem>
                                {sucursales.map((suc: any) => (
                                    <MenuItem key={suc.idSucursal} value={suc.idSucursal} disabled={suc.idSucursal === idSucursal}>
                                        {suc.nombreSucursal}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            fullWidth
                            label="Fecha Necesaria"
                            type="date"
                            size="small"
                            value={fechaNecesaria}
                            onChange={(e) => setFechaNecesaria(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                                if (productoSeleccionado && e.target.value !== (productoSeleccionado.nombreMercaderia || productoSeleccionado.nombre)) {
                                    setProductoSeleccionado(null);
                                }
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
                            <TableCell>Mercadería</TableCell>
                            <TableCell>Código</TableCell>
                            <TableCell align="right">Cantidad</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.nro}</TableCell>
                                <TableCell>{item.nombreMercaderia}</TableCell>
                                <TableCell>{item.codigo}</TableCell>
                                <TableCell align="right">{item.cantidadSolicitada}</TableCell>
                                <TableCell align="center">
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => eliminarDetalle(item.idDetPedidoInternoTmp)}
                                    >
                                        <DeleteIcon fontSize="small" />
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
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={guardarPedido}
                >
                    Guardar Pedido (F2)
                </Button>
            </Box>

            {/* Modal de Búsqueda */}
            <SearchProductModal
                open={openSearchModal}
                onClose={() => setOpenSearchModal(false)}
                idTerminalWeb={idTerminalWeb || 0}
                onSelectProduct={handleProductSelected}
                busqueda={busqueda}
                useComprasSearch={true}
            />
        </Box>
    );
};

export default GenerarPedidoInterno;

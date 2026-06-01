import React, { useState, useRef } from 'react';
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
    IconButton,
    InputLabel,
    MenuItem,
    FormControl,
    Select
} from '@mui/material';
import TextField from '../../components/UppercaseTextField';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import SearchProductModal from '../../components/SearchProductModal';
import { useStockInicial } from '../../hooks/useStockInicial';
import RequirePermission from '../../components/RequirePermission';
import { useTerminal } from '../../hooks/useTerminal';

const StockInicial: React.FC = () => {
    const { idTerminalWeb } = useTerminal();

    // Custom Hook
    const {
        items,
        depositos,
        idDeposito,
        setIdDeposito,
        error,
        setError,
        success,
        setSuccess,
        loading,
        agregarDetalle,
        eliminarDetalle,
        guardarStockInicial
    } = useStockInicial();

    // Local UI State
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [productoSearchTerm, setProductoSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [cantidad, setCantidad] = useState('');
    const [costo, setCosto] = useState('');

    const cantidadRef = useRef<HTMLInputElement>(null);
    const costoRef = useRef<HTMLInputElement>(null);

    const handleProductSelect = (product: any) => {
        setSelectedProduct(product);
        setProductoSearchTerm(product.nombreProducto || product.nombreMercaderia);
        setSearchModalOpen(false);
        setCosto(product.costo || '');
        setTimeout(() => {
            cantidadRef.current?.focus();
        }, 100);
    };

    const handleAgregar = async () => {
        if (!selectedProduct) {
            setError('Debe seleccionar un producto');
            return;
        }
        if (!cantidad || Number(cantidad) <= 0) {
            setError('Cantidad inválida');
            return;
        }
        if (!costo || Number(costo) < 0) {
            setError('Costo inválido');
            return;
        }

        const ok = await agregarDetalle(selectedProduct, Number(cantidad), Number(costo));
        if (ok) {
            setCantidad('');
            setCosto('');
            setSelectedProduct(null);
            setProductoSearchTerm('');
        }
    };

    const handleGuardar = async () => {
        // TODO: Obtener ID Usuario real
        await guardarStockInicial(1);
    };

    return (
        <RequirePermission permission="ACCESO_AJUSTES">
            {/* Reutilizamos permiso ACCESO_AJUSTES por ahora, o crear uno nuevo */}
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Carga de Stock Inicial
                </Typography>

                {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

                {/* Cabecera Deposito */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Depósito</InputLabel>
                                <Select
                                    value={idDeposito}
                                    label="Depósito"
                                    onChange={(e) => setIdDeposito(Number(e.target.value))}
                                >
                                    {depositos.map((dep: any) => (
                                        <MenuItem key={dep.idDeposito} value={dep.idDeposito}>
                                            {dep.nombreDeposito}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Formulario de Carga */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={5}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Producto (Enter o Click Lupa)"
                                    value={productoSearchTerm}
                                    onChange={(e) => {
                                        setProductoSearchTerm(e.target.value);
                                        if (selectedProduct && e.target.value !== (selectedProduct.nombreProducto || selectedProduct.nombreMercaderia)) {
                                            setSelectedProduct(null);
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') setSearchModalOpen(true);
                                    }}
                                    size="small"
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton size="small" onClick={() => setSearchModalOpen(true)}>
                                                <SearchIcon />
                                            </IconButton>
                                        )
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                fullWidth
                                label="Cantidad"
                                type="number"
                                value={cantidad}
                                inputRef={cantidadRef}
                                onChange={(e) => setCantidad(e.target.value)}
                                size="small"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') costoRef.current?.focus();
                                }}
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                fullWidth
                                label="Costo Unit."
                                type="number"
                                value={costo}
                                inputRef={costoRef}
                                onChange={(e) => setCosto(e.target.value)}
                                size="small"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') handleAgregar();
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={1}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleAgregar}
                                disabled={loading || !selectedProduct}
                            >
                                <AddIcon />
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Tabla de Items */}
                <TableContainer component={Paper} sx={{ maxHeight: '400px', mb: 2 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nro</TableCell>
                                <TableCell>Código</TableCell>
                                <TableCell>Producto</TableCell>
                                <TableCell align="right">Cantidad</TableCell>
                                <TableCell align="right">Costo</TableCell>
                                <TableCell align="right">Subtotal</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.idDetStockInicialTmp}>
                                    <TableCell>{item.nro}</TableCell>
                                    <TableCell>{item.codigo}</TableCell>
                                    <TableCell>{item.nombreProducto}</TableCell>
                                    <TableCell align="right">{item.cantidad}</TableCell>
                                    <TableCell align="right">{Number(item.costo).toLocaleString()}</TableCell>
                                    <TableCell align="right">{Number(item.totalValorizado).toLocaleString()}</TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" color="error" onClick={() => eliminarDetalle(item.idDetStockInicialTmp)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay items cargados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleGuardar}
                        disabled={loading || items.length === 0}
                    >
                        Guardar Stock Inicial
                    </Button>
                </Box>

                <SearchProductModal
                    open={searchModalOpen}
                    onClose={() => setSearchModalOpen(false)}
                    onSelectProduct={handleProductSelect}
                    idTerminalWeb={idTerminalWeb || 0}
                    busqueda={productoSearchTerm}
                    useComprasSearch={true} // Usamos la misma búsqueda que compras/ajustes
                />
            </Box>
        </RequirePermission>
    );
};

export default StockInicial;

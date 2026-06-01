import React, { useState, useEffect, useRef } from 'react';
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
    MenuItem,
    IconButton,
    Autocomplete
} from '@mui/material';
import TextField from '../../components/UppercaseTextField';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTerminal } from '../../hooks/useTerminal';
import { ajustesService } from '../../services/ajustes.service';
import SearchProductModal from '../../components/SearchProductModal';
import { remisionService } from '../../services/remision.service';
import { comprasService } from '../../services/compras.service';
import RequirePermission from '../../components/RequirePermission';

const Ajustes: React.FC = () => {
    const { idTerminalWeb } = useTerminal();

    // Form State
    const [deposito, setDeposito] = useState([]);
    const [explicacion, setExplicacion] = useState('');
    const [selectedDeposito, setSelectedDeposito] = useState<any>(null);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [cantidad, setCantidad] = useState('');
    const [stock, setStock] = useState('');
    const [tipoAjuste, setTipoAjuste] = useState([]);
    const [selectedTipoAjuste, setSelectedTipoAjuste] = useState<any>(null);

    // Data Lists
    const [items, setItems] = useState<any[]>([]);
    const [motivos, setMotivos] = useState(['AUDITORIA', 'ROTURA', 'VENCIMIENTO', 'OTRO']); // Example list

    // UI State
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [productoSearchTerm, setProductoSearchTerm] = useState('');

    useEffect(() => {
        if (idTerminalWeb) {
            cargarDepositos();
            cargarTipoAjustes();
        }
    }, [idTerminalWeb]);

    useEffect(() => {
        if (idTerminalWeb && selectedTipoAjuste) {
            cargarDetalles();
        } else {
            setItems([]);
        }
    }, [idTerminalWeb, selectedTipoAjuste]);

    const handleProductoSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const term = (e.target as HTMLInputElement).value;
            if (!term) {
                setOpenProductoModal(true);
                return;
            }

            try {
                const results = await comprasService.buscarProducto(term);
                if (results && results.length === 1) {
                    handleProductSelect(results[0]);
                } else {
                    setProductoSearchTerm(term);
                    setOpenProductoModal(true);
                }
            } catch (error) {
                console.error("Error buscando producto", error);
                setOpenProductoModal(true);
            }
        }
    };

    const setOpenProductoModal = (open: boolean) => {
        setSearchModalOpen(open);
    };

    const cargarDetalles = async () => {
        if (!idTerminalWeb || !selectedTipoAjuste) return;
        try {
            const data = await ajustesService.consultaDetAjusteStockTmp(idTerminalWeb, selectedTipoAjuste);
            setItems(data || []);
        } catch (err: any) {
            console.error(err);
            setError('Error al cargar detalles');
        }
    };

    const cargarDepositos = async () => {
        if (!idTerminalWeb) return;
        try {
            const data = await remisionService.consultaDeposito();
            setDeposito(data || []);
        } catch (err: any) {
            console.error(err);
            setError('Error al cargar sucursales');
        }
    };

    const cargarTipoAjustes = async () => {
        if (!idTerminalWeb) return;
        try {
            const data = await ajustesService.consultaTipoAjuste();
            setTipoAjuste(data || []);
        } catch (err: any) {
            console.error(err);
            setError('Error al cargar tipo ajuste');
        }
    }

    const handleProductSelect = (product: any) => {
        setSelectedProduct(product);
        setProductoSearchTerm(product.nombreProducto || product.nombreMercaderia);
        setStock(product.existencia || '0'); // Assuming product object has existence/stock
        setSearchModalOpen(false);
    };

    const handleAgregar = async () => {
        if (!idTerminalWeb) {
            setError('Terminal no configurada');
            return;
        }
        if (!selectedProduct) {
            setError('Debe seleccionar un producto');
            return;
        }
        if (!cantidad || Number(cantidad) <= 0) {
            setError('Debe ingresar una cantidad válida');
            return;
        }
        if (!selectedTipoAjuste) {
            setError('Debe seleccionar un tipo de ajuste');
            return;
        }

        setLoading(true);
        try {
            await ajustesService.agregarDetAjusteStockTmp({
                idTerminalWeb,
                idStock: selectedProduct.idStock || selectedProduct.idProducto, // Adjust based on product object
                cantidad: Number(cantidad),
                esNegativo: false // TODO: Determine based on logic or UI
            });
            await cargarDetalles();
            setCantidad('');
            setSelectedProduct(null);
            setStock('');
            setSuccess('Item agregado correctamente');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (idDetAjusteStockTmp: number) => {
        if (!idTerminalWeb) return;
        try {
            await ajustesService.eliminarDetAjusteStockTmp(idTerminalWeb, idDetAjusteStockTmp);
            await cargarDetalles();
            setSuccess('Eliminado correctamente');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleGuardar = async () => {
        if (!idTerminalWeb) return;
        if (items.length === 0) {
            setError('No hay items en el ajuste');
            return;
        }
        if (!selectedDeposito) {
            setError('Debe seleccionar un depósito');
            return;
        }
        if (!selectedTipoAjuste) {
            setError('Debe seleccionar un tipo de ajuste');
            return;
        }

        setLoading(true);
        try {
            await ajustesService.guardarAjusteStock({
                idUsuario: 1, // TODO: Get from context
                idTerminalWeb,
                idDeposito: selectedDeposito ? selectedDeposito.idDeposito : 1,
                idTipoAjuste: selectedTipoAjuste || 1,
                motivo: explicacion
            });
            setSuccess('Ajuste guardado exitosamente');
            setItems([]);
            setExplicacion('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNuevo = () => {
        setItems([]);
        setExplicacion('');
        setSelectedProduct(null);
        setCantidad('');
        setStock('');
        setSuccess('');
        setError('');
    };

    return (
        <RequirePermission permission="ACCESO_AJUSTES">
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Ajustes de Stock
                </Typography>

                {/* Messages */}
                {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

                <Paper sx={{ p: 2, mb: 2 }}>
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        flexDirection: 'column'
                    }}>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                            <Autocomplete
                                options={deposito}
                                getOptionLabel={deposito => deposito.nombreDeposito}
                                value={selectedDeposito}
                                onChange={(_, newValue) => {
                                    setSelectedDeposito(newValue);
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Depósito" size="small" fullWidth />
                                )}
                            />
                            <FormControl fullWidth size="small">
                                <InputLabel>Tipo de Ajuste</InputLabel>
                                <Select
                                    value={selectedTipoAjuste || 0}
                                    label="Tipo de Ajuste"
                                    onChange={(e) => setSelectedTipoAjuste(Number(e.target.value))}
                                >
                                    <MenuItem value={0}>Seleccione...</MenuItem>
                                    {tipoAjuste.map((tipo: any) => (
                                        <MenuItem key={tipo.idTipoAjuste} value={tipo.idTipoAjuste}>
                                            {tipo.descripcion}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <TextField
                            fullWidth
                            label="Explicación"
                            value={explicacion}
                            onChange={(e) => setExplicacion(e.target.value)}
                            size="small"
                            multiline
                            rows={3}
                        />
                    </Box>
                </Paper>
                {/* Main Form */}
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                        {/* Row 2 */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Producto (Enter para buscar)"
                                    value={productoSearchTerm}
                                    onChange={(e) => {
                                        setProductoSearchTerm(e.target.value);
                                        if (selectedProduct && e.target.value !== selectedProduct.nombreProducto) {
                                            setSelectedProduct(null);
                                            setStock('');
                                        }
                                    }}
                                    onKeyDown={handleProductoSearchKeyDown}
                                    size="small"
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton size="small" onClick={() => setOpenProductoModal(true)}>
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
                                label="Cant."
                                type="number"
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={6} md={1}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAgregar}
                                fullWidth
                                sx={{ height: '100%' }}
                            >
                                <AddIcon />
                            </Button>
                        </Grid>

                    </Grid>
                </Paper>


                {/* Table */}
                <TableContainer component={Paper} sx={{ maxHeight: '400px' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Nro</TableCell>
                                <TableCell>Codigo</TableCell>
                                <TableCell>Nombre de Mercaderia</TableCell>
                                <TableCell>Stock</TableCell>
                                <TableCell>Cant.</TableCell>
                                <TableCell>Stock Final</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item.codigo || '-'}</TableCell>
                                    <TableCell>{item.nombreMercaderia || item.producto || '-'}</TableCell>
                                    <TableCell>{item.stockAnterior || '-'}</TableCell>
                                    <TableCell>{item.cantidadAjuste}</TableCell>
                                    <TableCell>{item.stockNuevo || '-'}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" color="error" onClick={() => handleEliminar(item.idDetAjusteStockTmp)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay items en el ajuste
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Action Buttons */}
                <Paper sx={{ p: 2, mt: 2, display: 'flex', gap: 2 }}>
                    <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleGuardar}>
                        Guardar
                    </Button>
                </Paper>

                <SearchProductModal
                    open={searchModalOpen}
                    onClose={() => setSearchModalOpen(false)}
                    onSelectProduct={handleProductSelect}
                    idTerminalWeb={idTerminalWeb || 0}
                    busqueda={productoSearchTerm}
                    useComprasSearch={true}
                />
            </Box>
        </RequirePermission>
    );
};

export default Ajustes;

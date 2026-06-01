import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    Box,
    Alert,
} from '@mui/material';
import TextField from './UppercaseTextField';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { remisionService } from '../services/remision.service';

export interface ProductoRemisionResultado {
    idProducto: number;
    codigo: string;
    nombreMercaderia: string;
    precio: number;
    stock: number;
    idStock: number;
    // Agrega otros campos que devuelva sp_consultaStockParaRemision si son necesarios
}

interface SearchProductRemisionModalProps {
    open: boolean;
    onClose: () => void;
    idTerminalWeb: number;
    onSelectProduct: (producto: ProductoRemisionResultado) => void;
    busqueda?: string;
}

const SearchProductRemisionModal: React.FC<SearchProductRemisionModalProps> = ({
    open,
    onClose,
    idTerminalWeb,
    onSelectProduct,
    busqueda,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [productos, setProductos] = useState<ProductoRemisionResultado[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    const busquedaRef = useRef<HTMLInputElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    // Ref para mantener referencia actualizada
    const productosRef = useRef<ProductoRemisionResultado[]>([]);
    const selectedIndexRef = useRef<number>(-1);

    // Mantener productosRef sincronizado
    useEffect(() => {
        productosRef.current = productos;
    }, [productos]);

    useEffect(() => {
        selectedIndexRef.current = selectedIndex;
    }, [selectedIndex]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const currentProductos = productosRef.current;

        // Si no hay productos, solo permitir Enter para buscar
        if (currentProductos.length === 0) {
            if (e.key === 'Enter' && searchTerm.trim()) {
                e.preventDefault();
                handleSearch();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < currentProductos.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                const currentIndex = selectedIndexRef.current;
                if (currentIndex >= 0 && currentIndex < currentProductos.length) {
                    onSelectProduct(currentProductos[currentIndex]);
                    onClose();
                }
                break;
        }
    }, [onSelectProduct, onClose, searchTerm]);

    const handleSearch = async (term?: string) => {
        const query = term?.trim() ?? searchTerm?.trim();

        if (!query) {
            setProductos([]);
            setError('');
            setSelectedIndex(-1);
            return;
        }

        setIsSearching(true);
        setError('');

        try {
            const results = await remisionService.consultarStock(query, idTerminalWeb);

            if (results.length === 1) {
                onSelectProduct(results[0]);
                onClose();
            } else {
                setProductos(results);
                if (results.length > 0) {
                    setSelectedIndex(0);
                } else {
                    setSelectedIndex(-1);
                    setError('No se encontraron productos');
                }
            }
        } catch (error: any) {
            console.error('Error al buscar productos:', error);
            setError(error.message || 'Error al buscar productos');
            setProductos([]);
            setSelectedIndex(-1);
        } finally {
            setIsSearching(false);
        }
    };

    // Auto-scroll cuando cambia la selección
    useEffect(() => {
        if (selectedIndex >= 0 && tableContainerRef.current) {
            const container = tableContainerRef.current;
            const rows = container.querySelectorAll('tbody tr');
            const selectedRow = rows[selectedIndex] as HTMLElement;

            if (selectedRow) {
                const containerRect = container.getBoundingClientRect();
                const rowRect = selectedRow.getBoundingClientRect();

                if (rowRect.bottom > containerRect.bottom || rowRect.top < containerRect.top) {
                    selectedRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            }
        }
    }, [selectedIndex]);

    const handleRowClick = (producto: ProductoRemisionResultado) => {
        onSelectProduct(producto);
        onClose();
    };

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            const initialTerm = busqueda?.trim() ?? '';
            setSearchTerm(initialTerm);
            setProductos([]);
            setError('');
            setSelectedIndex(-1);

            if (initialTerm) {
                handleSearch(initialTerm);
            }

            setTimeout(() => busquedaRef.current?.focus(), 100);
        }
    }, [open, busqueda]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            onKeyDown={handleKeyDown}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    minHeight: '500px',
                    maxHeight: '80vh',
                }
            }}
        >
            <DialogTitle sx={{
                backgroundColor: '#f5f5f5',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.5
            }}>
                <Typography variant="h6" component="div">
                    Búsqueda de Productos - Remisión (↑↓ Enter)
                </Typography>
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={onClose}
                    aria-label="close"
                    size="small"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 2 }}>
                {/* Search bar */}
                <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        label="Buscar producto"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Ingrese código, código de barra o nombre del producto"
                        disabled={isSearching}
                        inputRef={busquedaRef}
                    />
                    <IconButton
                        color="primary"
                        onClick={() => handleSearch()}
                        disabled={isSearching || !searchTerm.trim()}
                        size="small"
                    >
                        <SearchIcon />
                    </IconButton>
                </Box>

                {/* Error message */}
                {error && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {productos.length === 0 && !isSearching && searchTerm && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            No se encontraron productos. Intente con otro término de búsqueda.
                        </Typography>
                    </Box>
                )}

                {productos.length > 0 && (
                    <TableContainer component={Paper} elevation={0} ref={tableContainerRef}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>Código</TableCell>
                                    <TableCell sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>Nombre del Producto</TableCell>
                                    <TableCell align="right" sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>Precio</TableCell>
                                    <TableCell align="right" sx={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>Stock</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {productos.map((producto, index) => (
                                    <TableRow
                                        key={producto.idProducto || index}
                                        onClick={() => handleRowClick(producto)}
                                        selected={index === selectedIndex}
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: index === selectedIndex ? '#c8e6c9 !important' : undefined,
                                            '&:hover': {
                                                backgroundColor: index === selectedIndex ? '#c8e6c9' : '#e8f5e9',
                                            },
                                            '&:nth-of-type(even)': {
                                                backgroundColor: index === selectedIndex ? '#c8e6c9' : '#f9f9f9',
                                            },
                                            '&:nth-of-type(even):hover': {
                                                backgroundColor: index === selectedIndex ? '#c8e6c9' : '#e8f5e9',
                                            },
                                        }}
                                    >
                                        <TableCell>{producto.codigo}</TableCell>
                                        <TableCell>{producto.nombreMercaderia}</TableCell>
                                        <TableCell align="right">₲{producto.precio?.toLocaleString()}</TableCell>
                                        <TableCell align="right" sx={{ color: producto.stock > 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                                            {producto.stock}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SearchProductRemisionModal;

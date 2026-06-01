import React, { useRef, useState, useEffect, useCallback } from 'react';
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
import { productoService } from '../services/producto.service';
import { comprasService } from '../services/compras.service';

export interface ProductoResultado {
  idProducto: number;
  codigo: string;
  nombreMercaderia: string;
  precio: number;
  stock: number;
  nombreImpuesto: string;
  origen: string;
  idStock: number;
}

interface SearchProductModalProps {
  open: boolean;
  onClose: () => void;
  idTerminalWeb: number;
  onSelectProduct: (producto: ProductoResultado) => void;
  busqueda?: string;
  useComprasSearch?: boolean;
}

const SearchProductModal: React.FC<SearchProductModalProps> = ({
  open,
  onClose,
  idTerminalWeb,
  onSelectProduct,
  busqueda,
  useComprasSearch = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState<ProductoResultado[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const busquedaRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  // Ref para mantener referencia actualizada de productos (evita stale closures)
  const productosRef = useRef<ProductoResultado[]>([]);
  // Ref para mantener referencia actualizada de selectedIndex
  const selectedIndexRef = useRef<number>(-1);

  // Mantener productosRef sincronizado con productos
  useEffect(() => {
    productosRef.current = productos;
  }, [productos]);

  // Mantener selectedIndexRef sincronizado con selectedIndex
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

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
      let results;
      if (useComprasSearch) {
        results = await comprasService.buscarProducto(query);
      } else {
        results = await productoService.consultarPrecioProducto(query, idTerminalWeb);
      }

      if (results.length === 1) {
        onSelectProduct(results[0]);
        onClose();
      } else {
        setProductos(results);
        // Auto-seleccionar el primer producto si hay resultados
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
        setSelectedIndex((prev) => {
          const newIndex = prev < currentProductos.length - 1 ? prev + 1 : prev;
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : 0;
          return newIndex;
        });
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

  // Scroll automático para mantener visible el elemento seleccionado
  useEffect(() => {
    if (selectedIndex >= 0 && tableContainerRef.current) {
      const container = tableContainerRef.current;
      const rows = container.querySelectorAll('tbody tr');
      const selectedRow = rows[selectedIndex] as HTMLElement;

      if (selectedRow) {
        const containerRect = container.getBoundingClientRect();
        const rowRect = selectedRow.getBoundingClientRect();

        if (rowRect.bottom > containerRect.bottom) {
          selectedRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else if (rowRect.top < containerRect.top) {
          selectedRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }
  }, [selectedIndex]);

  const handleRowClick = (producto: ProductoResultado) => {
    onSelectProduct(producto);
    onClose();
  };

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      // Aqui hago que lo que escribio el usuario venga tambien al modal
      const initialTerm = busqueda?.trim() ?? '';
      setSearchTerm(initialTerm);
      setProductos([]);
      setError('');
      setSelectedIndex(-1);

      if (initialTerm) {
        handleSearch(initialTerm);
      }

      // Enfocar el campo de búsqueda cuando se abre el modal
      setTimeout(() => {
        busquedaRef.current?.focus();
      }, 100);
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
          Búsqueda de Productos (↑↓ para navegar, Enter para seleccionar)
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
                  <TableCell sx={{
                    backgroundColor: '#e3f2fd',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #90caf9'
                  }}>
                    Código
                  </TableCell>
                  <TableCell sx={{
                    backgroundColor: '#e3f2fd',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #90caf9'
                  }}>
                    Nombre del Producto
                  </TableCell>
                  <TableCell sx={{
                    backgroundColor: '#e3f2fd',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #90caf9'
                  }}>
                    Presentación
                  </TableCell>
                  <TableCell align="right" sx={{
                    backgroundColor: '#e3f2fd',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #90caf9'
                  }}>
                    Precio
                  </TableCell>
                  <TableCell align="right" sx={{
                    backgroundColor: '#e3f2fd',
                    fontWeight: 'bold',
                    borderBottom: '2px solid #90caf9'
                  }}>
                    Stock
                  </TableCell>
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
                    <TableCell>
                      <Typography variant="body2">
                        {producto.nombreMercaderia}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {producto.origen === 'N' ? 'Nacional' : 'Importado'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {producto.nombreImpuesto}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        ₲{producto.precio?.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={producto.stock > 0 ? 'success.main' : 'error.main'}
                        fontWeight="medium"
                      >
                        {producto.stock}
                      </Typography>
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

export default SearchProductModal;


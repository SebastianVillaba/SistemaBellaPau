import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Alert,
  Grid,
} from '@mui/material';
import TextField from './UppercaseTextField';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { personaService } from '../services/persona.service';
import ClienteForm from './ClienteForm';

interface ClienteResultado {
  idCliente: number;
  nombreCliente: string;
  ruc: string;
  dv: string;
  direccion: string;
  celular: string;
}

interface Cliente {
  nombre: string;
  direccion: string;
  telefono: string;
  documento: string;
  dv: string;
}

interface SearchClienteModalProps {
  open: boolean;
  onClose: () => void;
  onClienteSelected: (cliente: ClienteResultado) => void;
}

const SearchClienteModal: React.FC<SearchClienteModalProps> = ({
  open,
  onClose,
  onClienteSelected,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState<ClienteResultado[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<ClienteResultado | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const busquedaRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  // Ref para mantener referencia actualizada de clientes (evita stale closures)
  const clientesRef = useRef<ClienteResultado[]>([]);
  const selectedIndexRef = useRef<number>(-1);

  // Mantener clientesRef sincronizado
  useEffect(() => {
    clientesRef.current = clientes;
  }, [clientes]);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentClientes = clientesRef.current;

    // Si no hay clientes, solo permitir Enter para buscar
    if (currentClientes.length === 0) {
      if (e.key === 'Enter' && searchTerm.trim()) {
        e.preventDefault();
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < currentClientes.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        const currentIndex = selectedIndexRef.current;
        if (currentIndex >= 0 && currentIndex < currentClientes.length) {
          onClienteSelected(currentClientes[currentIndex]);
          onClose();
        }
        break;
    }
  }, [onClienteSelected, onClose, searchTerm]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setClientes([]);
      setError('');
      setSelectedIndex(-1);
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const results = await personaService.consultaCliente(searchTerm.trim());
      setClientes(results);

      if (results.length > 0) {
        setSelectedIndex(0);
      } else {
        setSelectedIndex(-1);
        setError('No se encontraron clientes');
      }
    } catch (error: any) {
      console.error('Error al buscar clientes:', error);
      setError(error.message || 'Error al buscar clientes');
      setClientes([]);
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

  const handleRowClick = (cliente: ClienteResultado) => {
    setSelectedCliente(cliente);
    onClienteSelected(cliente);
    onClose(); // Cierra el modal al seleccionar
  };

  const handleClienteFormSuccess = () => {
    // Cuando se agrega un cliente exitosamente, cambiar a la pestaña de búsqueda
    setTabValue(0);
    // Opcional: limpiar búsqueda y recargar
    setSearchTerm('');
    setClientes([]);
    setSelectedCliente(null);
  };

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSearchTerm('');
      setClientes([]);
      setError('');
      setSelectedCliente(null);
      setSelectedIndex(-1);
      setTabValue(0);
      setTimeout(() => busquedaRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '600px',
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
          Gestión de Clientes
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

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Buscar Cliente" />
            <Tab label="Agregar Cliente" />
          </Tabs>
        </Box>

        {/* Tab 1: Buscar Cliente */}
        {tabValue === 0 && (
          <Box sx={{ p: 2 }}>
            {/* Search bar */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Buscar cliente por nombre (↑↓ Enter)"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ingrese el nombre del cliente"
                disabled={isSearching}
                inputRef={busquedaRef}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim()}
                startIcon={<SearchIcon />}
              >
                Buscar
              </Button>
            </Box>

            {/* Error message */}
            {error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Lista de clientes */}
            {clientes.length > 0 && (
              <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 400 }} ref={tableContainerRef}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Nombre del Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>RUC</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clientes.map((cliente, index) => (
                      <TableRow
                        key={cliente.idCliente}
                        onClick={() => handleRowClick(cliente)}
                        selected={index === selectedIndex}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: index === selectedIndex ? '#c8e6c9 !important' : undefined,
                          '&:hover': {
                            backgroundColor: index === selectedIndex ? '#c8e6c9' : '#e8f5e9',
                          },
                        }}
                      >
                        <TableCell>{cliente.idCliente}</TableCell>
                        <TableCell>{cliente.nombreCliente}</TableCell>
                        <TableCell>{cliente.ruc}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Tab 2: Agregar Cliente */}
        {tabValue === 1 && (
          <Box sx={{ p: 2 }}>
            <ClienteForm
              open={true} // El formulario está contenido, por lo que siempre está "abierto"
              onClose={() => setTabValue(0)} // Cambia de pestaña en lugar de cerrar
              onClienteSelected={(cliente) => {
                onClienteSelected({
                  idCliente: cliente.idPersona || 0,
                  nombreCliente: `${cliente.nombre} ${cliente.apellido || ''}`,
                  ruc: `${cliente.ruc}-${cliente.dv}`,
                  dv: cliente.dv,
                  direccion: cliente.direccion,
                  celular: cliente.celular || '',
                });
                onClose();
              }}
              onSuccess={handleClienteFormSuccess}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchClienteModal;
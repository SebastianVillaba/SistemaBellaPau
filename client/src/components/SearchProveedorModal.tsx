import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
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
} from '@mui/material';
import TextField from './UppercaseTextField';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { comprasService } from '../services/compras.service';

interface ProveedorResultado {
    idProveedor: number;
    nombre: string;
    nombreFantasia: string;
    rucProveedor: string;
    responsable: string;
}

interface SearchProveedorModalProps {
    open: boolean;
    onClose: () => void;
    onProveedorSelected: (proveedor: ProveedorResultado) => void;
}

const SearchProveedorModal: React.FC<SearchProveedorModalProps> = ({
    open,
    onClose,
    onProveedorSelected,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [proveedores, setProveedores] = useState<ProveedorResultado[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    const busquedaRef = useRef<HTMLInputElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    // Ref para mantener referencia actualizada
    const proveedoresRef = useRef<ProveedorResultado[]>([]);
    const selectedIndexRef = useRef<number>(-1);

    // Mantener proveedoresRef sincronizado
    useEffect(() => {
        proveedoresRef.current = proveedores;
    }, [proveedores]);

    useEffect(() => {
        selectedIndexRef.current = selectedIndex;
    }, [selectedIndex]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const currentProveedores = proveedoresRef.current;

        // Si no hay proveedores, solo permitir Enter para buscar
        if (currentProveedores.length === 0) {
            if (e.key === 'Enter' && searchTerm.trim()) {
                e.preventDefault();
                handleSearch();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => (prev < currentProveedores.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                const currentIndex = selectedIndexRef.current;
                if (currentIndex >= 0 && currentIndex < currentProveedores.length) {
                    onProveedorSelected(currentProveedores[currentIndex]);
                    onClose();
                }
                break;
        }
    }, [onProveedorSelected, onClose, searchTerm]);

    // Para buscar el proveedor
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setProveedores([]);
            setError('');
            setSelectedIndex(-1);
            return;
        }

        setIsSearching(true);
        setError('');

        try {
            const results = await comprasService.buscarProveedores();

            setProveedores(results);
            console.log(results);

            if (results.length > 0) {
                setSelectedIndex(0);
            } else {
                setSelectedIndex(-1);
                setError('No se encontraron proveedores');
            }
        } catch (error: any) {
            console.error('Error al buscar proveedores:', error);
            setError(error.message || 'Error al buscar proveedores');
            setProveedores([]);
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

    const handleRowClick = (proveedor: ProveedorResultado) => {
        onProveedorSelected(proveedor);
        onClose();
    };

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setSearchTerm('');
            setProveedores([]);
            setError('');
            setSelectedIndex(-1);
            setTimeout(() => busquedaRef.current?.focus(), 100);
        }
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            onKeyDown={handleKeyDown}
            maxWidth="md"
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
                    Búsqueda de Proveedores (↑↓ Enter)
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
                <Box sx={{ mb: 2, display: 'flex', gap: 1, mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Buscar proveedor por nombre o RUC"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Ingrese nombre o RUC"
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

                {/* Lista de proveedores */}
                {proveedores.length > 0 && (
                    <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 350, border: '1px solid #eee' }} ref={tableContainerRef}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Nombre</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Nombre Fantasia</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>RUC</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Responsable</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {proveedores.map((prov, index) => (
                                    <TableRow
                                        key={prov.idProveedor}
                                        onClick={() => handleRowClick(prov)}
                                        selected={index === selectedIndex}
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: index === selectedIndex ? '#c8e6c9 !important' : undefined,
                                            '&:hover': {
                                                backgroundColor: index === selectedIndex ? '#c8e6c9' : '#e8f5e9',
                                            },
                                        }}
                                    >
                                        <TableCell>{prov.idProveedor}</TableCell>
                                        <TableCell>{prov.nombre}</TableCell>
                                        <TableCell>{prov.nombreFantasia}</TableCell>
                                        <TableCell>{prov.rucProveedor}</TableCell>
                                        <TableCell>{prov.responsable || '-'}</TableCell>
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

export default SearchProveedorModal;

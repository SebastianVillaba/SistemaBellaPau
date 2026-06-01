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
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel
} from '@mui/material';
import TextField from './UppercaseTextField';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { usuarioService } from '../services/usuario.service';
import type { Persona } from '../types/persona.types';

interface SearchPersonaModalProps {
    open: boolean;
    onClose: () => void;
    onPersonaSelected: (persona: Persona) => void;
}

const SearchPersonaModal: React.FC<SearchPersonaModalProps> = ({
    open,
    onClose,
    onPersonaSelected,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState<1 | 2>(1); // 1: Nombre, 2: RUC/Documento
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    const busquedaRef = useRef<HTMLInputElement>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    // Ref para mantener referencia actualizada
    const personasRef = useRef<Persona[]>([]);
    const selectedIndexRef = useRef<number>(-1);

    // Mantener personasRef sincronizado
    useEffect(() => {
        personasRef.current = personas;
    }, [personas]);

    useEffect(() => {
        selectedIndexRef.current = selectedIndex;
    }, [selectedIndex]);

    // Encontrar índices de personas disponibles (sin usuario)
    const getAvailableIndices = useCallback(() => {
        return personas
            .map((p: any, i) => (!p.tieneUsuario ? i : -1))
            .filter(i => i !== -1);
    }, [personas]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const currentPersonas = personasRef.current;

        // Si no hay personas, solo permitir Enter para buscar
        if (currentPersonas.length === 0) {
            if (e.key === 'Enter' && searchTerm.trim()) {
                e.preventDefault();
                handleSearch();
            }
            return;
        }

        const availableIndices = currentPersonas
            .map((p: any, i) => (!p.tieneUsuario ? i : -1))
            .filter(i => i !== -1);
        if (availableIndices.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => {
                    const currentPos = availableIndices.indexOf(prev);
                    if (currentPos === -1) return availableIndices[0];
                    return currentPos < availableIndices.length - 1
                        ? availableIndices[currentPos + 1]
                        : prev;
                });
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => {
                    const currentPos = availableIndices.indexOf(prev);
                    if (currentPos === -1) return availableIndices[0];
                    return currentPos > 0
                        ? availableIndices[currentPos - 1]
                        : prev;
                });
                break;
            case 'Enter':
                e.preventDefault();
                const currentIndex = selectedIndexRef.current;
                if (currentIndex >= 0 && currentIndex < currentPersonas.length) {
                    const persona = currentPersonas[currentIndex] as any;
                    if (!persona.tieneUsuario) {
                        onPersonaSelected(persona);
                        onClose();
                    }
                }
                break;
        }
    }, [onPersonaSelected, onClose, searchTerm]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setPersonas([]);
            setError('');
            setSelectedIndex(-1);
            return;
        }

        setIsSearching(true);
        setError('');

        try {
            // Usamos el servicio de usuario para buscar personas con info extra (tieneUsuario)
            const results = await usuarioService.buscarPersonaParaUsuario(searchTerm.trim());
            setPersonas(results);

            if (results.length > 0) {
                // Seleccionar la primera persona disponible
                const firstAvailable = results.findIndex((p: any) => !p.tieneUsuario);
                setSelectedIndex(firstAvailable >= 0 ? firstAvailable : -1);
            } else {
                setSelectedIndex(-1);
                setError('No se encontraron personas');
            }
        } catch (error: any) {
            console.error('Error al buscar personas:', error);
            setError(error.message || 'Error al buscar personas');
            setPersonas([]);
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

    const handleRowClick = (persona: Persona) => {
        onPersonaSelected(persona);
        onClose();
    };

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setSearchTerm('');
            setPersonas([]);
            setError('');
            setSearchBy(1);
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
                    Buscar Persona (↑↓ Enter)
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
                <Box sx={{ mb: 2 }}>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            label="Buscar Persona"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Nombre, Apellido o RUC"
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
                </Box>

                {error && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {personas.length > 0 && (
                    <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 350 }} ref={tableContainerRef}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Nombre</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>RUC / Doc</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Estado</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {personas.map((persona: any, index) => (
                                    <TableRow
                                        key={persona.idPersona}
                                        onClick={() => !persona.tieneUsuario && handleRowClick(persona)}
                                        selected={index === selectedIndex}
                                        sx={{
                                            cursor: persona.tieneUsuario ? 'not-allowed' : 'pointer',
                                            opacity: persona.tieneUsuario ? 0.6 : 1,
                                            backgroundColor: persona.tieneUsuario
                                                ? '#f5f5f5'
                                                : (index === selectedIndex ? '#c8e6c9 !important' : 'inherit'),
                                            '&:hover': {
                                                backgroundColor: persona.tieneUsuario
                                                    ? '#f5f5f5'
                                                    : (index === selectedIndex ? '#c8e6c9' : '#e8f5e9'),
                                            },
                                        }}
                                    >
                                        <TableCell>{persona.idPersona}</TableCell>
                                        <TableCell>{persona.nombreCompleto || `${persona.nombre} ${persona.apellido}`}</TableCell>
                                        <TableCell>{persona.ruc || persona.documento}</TableCell>
                                        <TableCell>{persona.email}</TableCell>
                                        <TableCell>
                                            {persona.tieneUsuario ? (
                                                <Typography variant="caption" color="error" fontWeight="bold">
                                                    YA TIENE USUARIO
                                                </Typography>
                                            ) : (
                                                <Typography variant="caption" color="success.main" fontWeight="bold">
                                                    DISPONIBLE
                                                </Typography>
                                            )}
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

export default SearchPersonaModal;

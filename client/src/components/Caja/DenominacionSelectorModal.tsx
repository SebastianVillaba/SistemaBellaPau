import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    CircularProgress,
    Typography,
    Box,
    TextField,
    InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { denominacionService, type Denominacion } from '../../services/denominacion.service';

interface DenominacionSelectorModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (denominacion: Denominacion) => void;
}

const DenominacionSelectorModal: React.FC<DenominacionSelectorModalProps> = ({
    open,
    onClose,
    onSelect,
}) => {
    const [denominaciones, setDenominaciones] = useState<Denominacion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const listRef = useRef<HTMLUListElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            cargarDenominaciones();
            setSelectedIndex(0);
            // Enfocar el campo de búsqueda al abrir
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [open]);

    // Resetear índice cuando cambia el filtro
    useEffect(() => {
        setSelectedIndex(0);
    }, [filtro]);

    const cargarDenominaciones = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await denominacionService.getDenominacionesActivas();
            setDenominaciones(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar denominaciones');
        } finally {
            setLoading(false);
        }
    };

    const denominacionesFiltradas = denominaciones.filter(d =>
        d.descripcion.toLowerCase().includes(filtro.toLowerCase()) ||
        d.valor.toString().includes(filtro)
    );

    const handleSelect = (denominacion: Denominacion) => {
        onSelect(denominacion);
        onClose();
        setFiltro('');
        setSelectedIndex(0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const maxIndex = denominacionesFiltradas.length - 1;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, maxIndex));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (denominacionesFiltradas.length > 0 && selectedIndex >= 0) {
                    handleSelect(denominacionesFiltradas[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    };

    // Auto-scroll al elemento seleccionado
    useEffect(() => {
        if (listRef.current && denominacionesFiltradas.length > 0) {
            const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex, denominacionesFiltradas.length]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PY', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            onKeyDown={handleKeyDown}
        >
            <DialogTitle>
                <Typography variant="h6">Seleccionar Denominación</Typography>
                <Typography variant="caption" color="text.secondary">
                    Use ↑↓ para navegar, Enter para seleccionar
                </Typography>
            </DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar denominación..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    inputRef={searchInputRef}
                    sx={{ mb: 2, mt: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" sx={{ p: 2 }}>
                        {error}
                    </Typography>
                ) : (
                    <List ref={listRef} sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {denominacionesFiltradas.map((denom, index) => (
                            <ListItem key={denom.idDenominacion} disablePadding data-index={index}>
                                <ListItemButton
                                    onClick={() => handleSelect(denom)}
                                    selected={index === selectedIndex}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 0.5,
                                        '&.Mui-selected': {
                                            backgroundColor: 'primary.main',
                                            color: 'primary.contrastText',
                                            '&:hover': {
                                                backgroundColor: 'primary.dark',
                                            },
                                        },
                                        '&:hover': {
                                            backgroundColor: 'primary.light',
                                            color: 'primary.contrastText',
                                        },
                                    }}
                                >
                                    <ListItemText
                                        primary={denom.descripcion}
                                        secondary={index === selectedIndex ? null : `Gs. ${formatCurrency(denom.valor)}`}
                                        primaryTypographyProps={{
                                            fontWeight: 'medium',
                                            color: index === selectedIndex ? 'inherit' : 'text.primary'
                                        }}
                                        secondaryTypographyProps={{
                                            color: index === selectedIndex ? 'inherit' : 'text.secondary'
                                        }}
                                    />
                                    {index === selectedIndex && (
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                            Gs. {formatCurrency(denom.valor)}
                                        </Typography>
                                    )}
                                </ListItemButton>
                            </ListItem>
                        ))}
                        {denominacionesFiltradas.length === 0 && (
                            <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                No se encontraron denominaciones
                            </Typography>
                        )}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default DenominacionSelectorModal;

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import TextField from '../../components/UppercaseTextField';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchClienteModal from '../../components/SearchClienteModal';
import { precobranzaService } from '../../services/precobranza.service';
import type { CobranzaPendiente, DetallePrecobranzaTmp } from '../../services/precobranza.service';
import { deliveryService } from '../../services/delivery.service';
import { useTerminal } from '../../hooks/useTerminal';

export default function Precobranza() {
    const { idTerminalWeb } = useTerminal();
    const [searchTerm, setSearchTerm] = useState('');
    const [cobranzasPendientes, setCobranzasPendientes] = useState<CobranzaPendiente[]>([]);
    const [precobranzaList, setPrecobranzaList] = useState<DetallePrecobranzaTmp[]>([]);
    const [openClienteModal, setOpenClienteModal] = useState(false);
    const [cliente, setCliente] = useState<any>(null);
    const [delivery, setDelivery] = useState('');
    const [deliveries, setDeliveries] = useState<any[]>([]);

    // Cargar deliveries al montar
    useEffect(() => {
        const loadDeliveries = async () => {
            try {
                const data = await deliveryService.getDeliveryActivo();
                setDeliveries(data);
            } catch (error) {
                console.error('Error loading deliveries:', error);
            }
        };
        loadDeliveries();
    }, []);

    // Cargar detalle temporal al montar o cambiar terminal
    const loadDetalleTmp = useCallback(async () => {
        if (idTerminalWeb) {
            try {
                const data = await precobranzaService.consultarDetPrecobranzaTmp(idTerminalWeb);
                setPrecobranzaList(data);
            } catch (error) {
                console.error('Error loading temp details:', error);
            }
        }
    }, [idTerminalWeb]);

    useEffect(() => {
        loadDetalleTmp();
    }, [loadDetalleTmp]);

    // Buscar cobranzas pendientes cuando se selecciona cliente
    useEffect(() => {
        const loadPendientes = async () => {
            if (cliente?.idCliente) {
                try {
                    const data = await precobranzaService.getCobranzasPendientes(cliente.idCliente);
                    setCobranzasPendientes(data);
                } catch (error) {
                    console.error('Error loading pending collections:', error);
                }
            } else {
                setCobranzasPendientes([]);
            }
        };
        loadPendientes();
    }, [cliente]);

    // Atajo de teclado Alt+C
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.altKey && event.key.toLowerCase() === 'c') {
                event.preventDefault();
                setOpenClienteModal(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleClienteSelected = (clienteData: any) => {
        setCliente(clienteData);
        setSearchTerm(clienteData.nombreCliente || clienteData.nombre);
    };

    const handleAddToPrecobranza = async (pedido: CobranzaPendiente) => {
        if (!idTerminalWeb) return;
        try {
            await precobranzaService.agregarDetPrecobranzaTmp(idTerminalWeb, pedido.idPedido);
            loadDetalleTmp();
        } catch (error) {
            console.error('Error adding to precobranza:', error);
            alert('Error al agregar detalle');
        }
    };

    const handleRemoveFromPrecobranza = async (idDetPrecobranzaTmp: number) => {
        if (!idTerminalWeb) return;
        try {
            await precobranzaService.eliminarDetPrecobranzaTmp(idTerminalWeb, idDetPrecobranzaTmp);
            loadDetalleTmp();
        } catch (error) {
            console.error('Error removing from precobranza:', error);
            alert('Error al eliminar detalle');
        }
    };

    const handleGenerarPrecobranza = async () => {
        if (!idTerminalWeb || !cliente?.idCliente || !delivery) {
            alert('Faltan datos requeridos (Terminal, Cliente o Delivery)');
            return;
        }
        try {
            const result = await precobranzaService.guardarPrecobranza({
                idUsuarioAlta: 1, // TODO: Get from auth
                idTerminalWeb,
                idDelivery: Number(delivery),
                idCliente: cliente.idCliente
            });
            alert(`Precobranza generada con éxito. ID: ${result.idPrecobranza}`);
            // Limpiar estado
            setCliente(null);
            setSearchTerm('');
            setDelivery('');
            setCobranzasPendientes([]);
            loadDetalleTmp();
        } catch (error) {
            console.error('Error generating precobranza:', error);
            alert('Error al generar precobranza');
        }
    };

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                {/* Left Panel: Search and Results */}
                <Grid size={8} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Search Bar */}
                    <Paper sx={{ p: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                placeholder="Buscar... (Alt+C)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={() => setOpenClienteModal(true)}
                            />
                            <Button variant="contained" startIcon={<SearchIcon />} onClick={() => setOpenClienteModal(true)}>
                                BUSCAR
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <FormControl size="small" sx={{ width: '25%' }}>
                                <InputLabel>Delivery</InputLabel>
                                <Select
                                    value={delivery}
                                    label="Delivery"
                                    onChange={(e) => setDelivery(e.target.value)}
                                >
                                    <MenuItem value="">Seleccione...</MenuItem>
                                    {deliveries.map((d: any) => (
                                        <MenuItem key={d.idDelivery} value={d.idDelivery}>
                                            {d.nombreDelivery}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Paper>

                    {/* Results Table */}
                    <TableContainer component={Paper} sx={{ flexGrow: 1 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Id Ped</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre y Apellido</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Accion</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cobranzasPendientes.map((row) => (
                                    <TableRow key={row.idPedido}>
                                        <TableCell>{row.idPedido}</TableCell>
                                        <TableCell>{row.nombreCliente}</TableCell>
                                        <TableCell>{new Date(row.fechaPedido).toLocaleDateString()}</TableCell>
                                        <TableCell>{row.nombreEstado}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleAddToPrecobranza(row)}
                                            >
                                                Agregar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                {/* Right Panel: Precobranza List */}
                <Grid size={4} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Paper sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #ccc', pb: 1 }}>
                            Pedidos a precobranza
                        </Typography>
                        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                            {precobranzaList.map((item, index) => (
                                <Box key={index} sx={{ p: 1, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">Pedido #{item.idPedido}</Typography>
                                        <Typography variant="caption">{item.nombreCliente}</Typography>
                                    </Box>
                                    <IconButton size="small" color="error" onClick={() => handleRemoveFromPrecobranza(item.idDetPrecobranzaTmp)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Footer Action */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                    variant="contained"
                    size="large"
                    sx={{ borderRadius: 20, px: 4 }}
                    onClick={handleGenerarPrecobranza}
                >
                    GENERAR PRECOBRANZA
                </Button>
            </Box>

            {/* Modal de búsqueda de cliente */}
            <SearchClienteModal
                open={openClienteModal}
                onClose={() => setOpenClienteModal(false)}
                onClienteSelected={handleClienteSelected}
            />
        </Box>
    );
}

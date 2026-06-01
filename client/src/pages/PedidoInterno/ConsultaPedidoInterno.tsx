import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    IconButton,
    Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { pedidoInternoService } from '../../services/pedidoInterno.service';
import { useTerminal } from '../../hooks/useTerminal';

const ConsultaPedidoInterno: React.FC = () => {
    const { idTerminalWeb } = useTerminal();
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [selectedPedido, setSelectedPedido] = useState<any | null>(null);
    const [detalles, setDetalles] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const cargarPedidos = async () => {
        if (!idTerminalWeb) return;
        try {
            const data = await pedidoInternoService.consultarPedidosRecibidos(idTerminalWeb);
            setPedidos(data);
        } catch (err: any) {
            setError('Error al cargar pedidos internos');
            console.error(err);
        }
    };

    useEffect(() => {
        cargarPedidos();
    }, [idTerminalWeb]);

    const handleVerDetalle = async (pedido: any) => {
        setLoading(true);
        console.log(pedido);
        
        try {
            const data = await pedidoInternoService.consultarDetalleEntrante(pedido.idPedidoInterno);
            setDetalles(data);
            setSelectedPedido(pedido);
            setOpenModal(true);
        } catch (err: any) {
            setError('Error al cargar detalle del pedido');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Consulta Pedido Interno
            </Typography>

            {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID Pedido</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Sucursal Solicitante</TableCell>
                            <TableCell>Observación</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pedidos.map((pedido) => (
                            <TableRow key={pedido.idPedidoInterno} hover>
                                <TableCell>{pedido.idPedidoInterno}</TableCell>
                                <TableCell>{new Date(pedido.fecha).toLocaleDateString()}</TableCell>
                                <TableCell>{pedido.sucursalSolicitante  }</TableCell>
                                <TableCell>{pedido.observacion}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Ver Detalle">
                                        <IconButton color="primary" onClick={() => handleVerDetalle(pedido)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {pedidos.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No hay pedidos internos pendientes.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de Detalle */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Detalle de Pedido #{selectedPedido?.idPedidoInterno}
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1"><strong>Origen:</strong> {selectedPedido?.sucursalSolicitante}</Typography>
                        <Typography variant="subtitle1"><strong>Observación:</strong> {selectedPedido?.observacion}</Typography>
                    </Box>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Código</TableCell>
                                    <TableCell>Producto</TableCell>
                                    <TableCell align="right">Cantidad Solicitada</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {detalles.map((detalle, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{detalle.codigo}</TableCell>
                                        <TableCell>{detalle.nombreMercaderia}</TableCell>
                                        <TableCell align="right">{detalle.cantidadSolicitada}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)} color="inherit">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ConsultaPedidoInterno;

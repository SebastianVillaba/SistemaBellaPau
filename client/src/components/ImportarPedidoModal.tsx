import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import { pedidoInternoService } from '../services/pedidoInterno.service';

interface ImportarPedidoModalProps {
    open: boolean;
    onClose: () => void;
    onImport: (idPedido: number) => void;
    idTerminalWeb: number;
}

const ImportarPedidoModal: React.FC<ImportarPedidoModalProps> = ({
    open,
    onClose,
    onImport,
    idTerminalWeb
}) => {
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        if (open && idTerminalWeb) {
            cargarPedidos();
        }
    }, [open, idTerminalWeb]);

    const cargarPedidos = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await pedidoInternoService.consultarPedidosRecibidos(idTerminalWeb);
            setPedidos(data);
        } catch (err: any) {
            setError('Error al cargar pedidos pendientes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleImportar = () => {
        if (selectedId) {
            onImport(selectedId);
            onClose();
            
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Importar Pedido Interno</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading ? (
                    <CircularProgress />
                ) : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Sucursal Origen</TableCell>
                                    <TableCell>Observación</TableCell>
                                    <TableCell align="center">Seleccionar</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pedidos.map((pedido) => (
                                    <TableRow
                                        key={pedido.idPedidoInterno}
                                        hover
                                        selected={selectedId === pedido.idPedidoInterno}
                                        onClick={() => setSelectedId(pedido.idPedidoInterno)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell>{pedido.idPedidoInterno}</TableCell>
                                        <TableCell>{new Date(pedido.fecha).toLocaleDateString()}</TableCell>
                                        <TableCell>{pedido.sucursalSolicitante}</TableCell>
                                        <TableCell>{pedido.observacion}</TableCell>
                                        <TableCell align="center">
                                            <input
                                                type="radio"
                                                checked={selectedId === pedido.idPedidoInterno}
                                                onChange={() => setSelectedId(pedido.idPedidoInterno)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {pedidos.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No hay pedidos pendientes para importar.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Button
                    onClick={handleImportar}
                    variant="contained"
                    color="primary"
                    disabled={!selectedId}
                >
                    Importar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImportarPedidoModal;

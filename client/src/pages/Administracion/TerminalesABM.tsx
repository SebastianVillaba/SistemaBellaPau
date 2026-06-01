import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider,
    IconButton,
    Alert,
    CircularProgress,
} from '@mui/material';
import TextField from '../../components/UppercaseTextField';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import type { TerminalWeb, TerminalWebSearchResult } from '../../types/terminalWeb.types';
import { terminalWebService } from '../../services/terminalWeb.service';
import TerminalWebForm from '../../components/TerminalWeb/TerminalWebForm';
import RequirePermission from '../../components/RequirePermission';

export default function TerminalesABM(): JSX.Element {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [terminales, setTerminales] = useState<TerminalWebSearchResult[]>([]);
    const [selectedTerminal, setSelectedTerminal] = useState<TerminalWeb | null>(null);
    const [isNewMode, setIsNewMode] = useState<boolean>(false);
    const [formData, setFormData] = useState<TerminalWeb>({
        nombreTerminal: '',
        terminalToken: '',
        idSucursal: 0,
        idFactura: 0,
        idDepositoVenta: 0,
        idDepositoCompra: 0,
        idDepositoRemision: 0,
        activo: true,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSearch = async () => {
        setLoading(true);
        setError('');

        try {
            const results = await terminalWebService.buscarTerminales(searchTerm);
            setTerminales(results);
        } catch (err: any) {
            console.error('Error al buscar terminales:', err);
            setError(err.message || 'Error al buscar terminales');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTerminal = async (terminalResult: TerminalWebSearchResult) => {
        setLoading(true);
        setError('');

        try {
            const terminalInfo = await terminalWebService.obtenerTerminal(terminalResult.idTerminalWeb);

            setSelectedTerminal(terminalInfo);
            setFormData(terminalInfo);
            setIsNewMode(false);
        } catch (err: any) {
            console.error('Error al obtener información de la terminal:', err);
            setError(err.message || 'Error al obtener información de la terminal');
        } finally {
            setLoading(false);
        }
    };

    const handleNew = () => {
        setIsNewMode(true);
        setSelectedTerminal(null);
        setError('');
        setFormData({
            nombreTerminal: '',
            terminalToken: '',
            idSucursal: 0,
            idFactura: 0,
            idDepositoVenta: 0,
            idDepositoCompra: 0,
            idDepositoRemision: 0,
            activo: true,
        });
    };

    const handleSave = async () => {
        setError('');

        // Validaciones básicas
        if (!formData.nombreTerminal) {
            setError('El nombre de la terminal es obligatorio');
            return;
        }
        if (!formData.terminalToken) {
            setError('El token es obligatorio');
            return;
        }
        if (!formData.idSucursal) {
            setError('La sucursal es obligatoria');
            return;
        }
        if (!formData.idDepositoVenta) {
            setError('El depósito de venta es obligatorio');
            return;
        }

        try {
            setLoading(true);

            // Obtener ID usuario actual
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const idUsuarioActual = user?.idUsuario || 1;

            if (isNewMode) {
                const dataToSend = {
                    ...formData,
                    idUsuarioAlta: idUsuarioActual,
                };
                const response = await terminalWebService.crearTerminal(dataToSend);
                alert(`✓ ${response.message}`);
                handleCancel();
                handleSearch(); // Recargar lista
            } else {
                const dataToSend = {
                    ...formData,
                    idTerminalWeb: selectedTerminal!.idTerminalWeb!,
                    idUsuarioMod: idUsuarioActual,
                    // activo se maneja en formData, convertir a number si es necesario (backend espera bit/boolean)
                    activo: formData.activo,
                };
                const response = await terminalWebService.modificarTerminal(dataToSend);
                alert(`✓ ${response.message}`);
                handleCancel();
                handleSearch(); // Recargar lista
            }
        } catch (err: any) {
            console.error('Error al guardar terminal:', err);
            setError(err.message || 'Error al guardar la terminal');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsNewMode(false);
        setSelectedTerminal(null);
        setError('');
        setFormData({
            nombreTerminal: '',
            terminalToken: '',
            idSucursal: 0,
            idFactura: 0,
            idDepositoVenta: 0,
            idDepositoCompra: 0,
            idDepositoRemision: 0,
            activo: true,
        });
    };

    return (
        <RequirePermission permission="ACCESO_SEGURIDAD">
            <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', gap: 2, p: 2 }}>
                {/* Panel de búsqueda lateral */}
                <Paper sx={{ width: 320, p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom>
                        Terminales Web
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <IconButton color="primary" onClick={handleSearch}>
                            <SearchIcon />
                        </IconButton>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Lista de resultados */}
                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                        <List dense>
                            {terminales.map((terminal) => (
                                <ListItem key={terminal.idTerminalWeb} disablePadding>
                                    <ListItemButton
                                        selected={selectedTerminal?.idTerminalWeb === terminal.idTerminalWeb}
                                        onClick={() => handleSelectTerminal(terminal)}
                                    >
                                        <ListItemText
                                            primary={terminal.nombreTerminal}
                                            secondary={`${terminal.nombreSucursal} - ${terminal.estado}`}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Paper>

                {/* Panel principal - Formulario */}
                <Paper sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5">
                            {isNewMode ? 'Nueva Terminal' : selectedTerminal ? 'Editar Terminal' : 'Detalle de Terminal'}
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {(isNewMode || selectedTerminal) ? (
                        <TerminalWebForm formData={formData} setFormData={setFormData} isNewMode={isNewMode} />
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60%' }}>
                            <Typography variant="h6" color="text.secondary">
                                Seleccione una terminal o haga clic en "Nueva" para comenzar
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 5 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleNew}
                        >
                            Nueva
                        </Button>

                        {(isNewMode || selectedTerminal) && (
                            <>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CancelIcon />}
                                    onClick={handleCancel}
                                >
                                    Cancelar
                                </Button>
                            </>
                        )}
                    </Box>
                </Paper>
            </Box>
        </RequirePermission>
    );
}

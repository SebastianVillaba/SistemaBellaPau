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
import type { Usuario, UsuarioSearchResult } from '../../types/usuario.types';
import { usuarioService } from '../../services/usuario.service';
import UsuarioForm from '../../components/Usuario/UsuarioForm';
import RequirePermission from '../../components/RequirePermission';

export default function UsuariosABM(): JSX.Element {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [usuarios, setUsuarios] = useState<UsuarioSearchResult[]>([]);
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
    const [isNewMode, setIsNewMode] = useState<boolean>(false);
    const [formData, setFormData] = useState<Usuario>({
        username: '',
        password: '',
        idRol: 0,
        idPersona: 0,
        activo: true,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSearch = async () => {
        // Permitir búsqueda vacía para traer todos
        setLoading(true);
        setError('');

        try {
            const results = await usuarioService.buscarUsuarios(searchTerm);
            setUsuarios(results);
        } catch (err: any) {
            console.error('Error al buscar usuarios:', err);
            setError(err.message || 'Error al buscar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUsuario = async (usuarioResult: UsuarioSearchResult) => {
        setLoading(true);
        setError('');

        try {
            const usuarioInfo = await usuarioService.obtenerUsuario(usuarioResult.idUsuario);

            setSelectedUsuario(usuarioInfo);
            setFormData({
                ...usuarioInfo,
                password: '', // No mostrar password
            });
            setIsNewMode(false);
        } catch (err: any) {
            console.error('Error al obtener información del usuario:', err);
            setError(err.message || 'Error al obtener información del usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleNew = () => {
        setIsNewMode(true);
        setSelectedUsuario(null);
        setError('');
        setFormData({
            username: '',
            password: '',
            idRol: 0,
            idPersona: 0,
            activo: true,
        });
    };

    const handleSave = async () => {
        setError('');

        // Validaciones básicas
        if (!formData.username) {
            setError('El nombre de usuario es obligatorio');
            return;
        }
        if (!formData.idRol) {
            setError('El rol es obligatorio');
            return;
        }
        if (!formData.idPersona) {
            setError('Debe seleccionar una persona');
            return;
        }
        if (isNewMode && !formData.password) {
            setError('La contraseña es obligatoria para nuevos usuarios');
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
                const response = await usuarioService.crearUsuario(dataToSend);
                alert(`✓ ${response.message}`);
                handleCancel();
                handleSearch(); // Recargar lista
            } else {
                const dataToSend = {
                    ...formData,
                    idUsuario: selectedUsuario!.idUsuario!,
                    // activo se maneja en formData, convertir a number si es necesario (backend espera tinyint)
                    activo: formData.activo ? 1 : 0,
                };
                // @ts-ignore - activo type mismatch workaround if needed, but service should handle
                const response = await usuarioService.modificarUsuario(dataToSend);
                alert(`✓ ${response.message}`);
                handleCancel();
                handleSearch(); // Recargar lista
            }
        } catch (err: any) {
            console.error('Error al guardar usuario:', err);
            setError(err.message || 'Error al guardar el usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsNewMode(false);
        setSelectedUsuario(null);
        setError('');
        setFormData({
            username: '',
            password: '',
            idRol: 0,
            idPersona: 0,
            activo: true,
        });
    };

    return (
        <RequirePermission permission="ACCESO_SEGURIDAD">
            <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', gap: 2, p: 2 }}>
                {/* Panel de búsqueda lateral */}
                <Paper sx={{ width: 320, p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom>
                        Usuarios
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
                            {usuarios.map((usuario) => (
                                <ListItem key={usuario.idUsuario} disablePadding>
                                    <ListItemButton
                                        selected={selectedUsuario?.idUsuario === usuario.idUsuario}
                                        onClick={() => handleSelectUsuario(usuario)}
                                    >
                                        <ListItemText
                                            primary={usuario.username}
                                            secondary={`${usuario.nombreCompleto} - ${usuario.nombreRol}`}
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
                            {isNewMode ? 'Nuevo Usuario' : selectedUsuario ? 'Editar Usuario' : 'Detalle de Usuario'}
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

                    {(isNewMode || selectedUsuario) ? (
                        <UsuarioForm formData={formData} setFormData={setFormData} isNewMode={isNewMode} />
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60%' }}>
                            <Typography variant="h6" color="text.secondary">
                                Seleccione un usuario o haga clic en "Nuevo" para comenzar
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
                            Nuevo
                        </Button>

                        {(isNewMode || selectedUsuario) && (
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

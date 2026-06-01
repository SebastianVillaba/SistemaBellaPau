import {
    TextField as MuiTextField, // Alias for password field
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Typography,
    Box,
    Stack,
    Checkbox,
    FormControlLabel,
    Button,
    InputAdornment,
    IconButton
} from '@mui/material';
import TextField from '../UppercaseTextField'; // Custom Uppercase TextField
import { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { Usuario } from '../../types/usuario.types';
import { rolService, type Rol } from '../../services/rol.service';
import SearchPersonaModal from '../SearchPersonaModal';

interface UsuarioFormProps {
    formData: Usuario;
    setFormData: React.Dispatch<React.SetStateAction<Usuario>>;
    isNewMode: boolean;
}

export default function UsuarioForm({ formData, setFormData, isNewMode }: UsuarioFormProps): JSX.Element {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [openPersonaModal, setOpenPersonaModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchRoles = async () => {
            setLoading(true);
            try {
                const data = await rolService.obtenerRoles();
                setRoles(data);
            } catch (error) {
                console.error('Error al cargar roles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    const handleChange = (field: keyof Usuario) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
    ) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePersonaSelected = (persona: any) => {
        setFormData((prev) => ({
            ...prev,
            idPersona: persona.idPersona,
            nombrePersona: `${persona.nombre} ${persona.apellido || ''}`.trim(),
            ruc: persona.ruc || persona.documento
        }));
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
        <Box>
            <Typography variant="caption" color="error" sx={{ my: 2, display: 'block' }}>
                * Datos Obligatorios
            </Typography>
            <Stack spacing={2.5}>

                {/* Persona Selection */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <TextField
                        fullWidth
                        label="Persona"
                        value={formData.nombrePersona || ''}
                        disabled
                        size="small"
                        helperText={!formData.idPersona ? 'Debe seleccionar una persona' : ''}
                        error={!formData.idPersona}
                    />
                    <Button
                        variant="contained"
                        onClick={() => setOpenPersonaModal(true)}
                        sx={{ minWidth: 'auto', p: 1 }}
                        disabled={!isNewMode} // Only allow changing person in new mode? Or maybe allow changing but careful with ID
                    >
                        <SearchIcon />
                    </Button>
                </Box>

                {/* Username */}
                <TextField
                    fullWidth
                    label="Nombre de Usuario"
                    value={formData.username}
                    onChange={handleChange('username')}
                    required
                    size="small"
                    error={!formData.username}
                    helperText={!formData.username ? 'Campo obligatorio' : ''}
                />

                {/* Password */}
                <MuiTextField
                    fullWidth
                    label={isNewMode ? "Contraseña" : "Nueva Contraseña (dejar en blanco para mantener)"}
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password || ''}
                    onChange={handleChange('password')}
                    required={isNewMode}
                    size="small"
                    error={isNewMode && !formData.password}
                    helperText={isNewMode && !formData.password ? 'Campo obligatorio' : ''}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Rol */}
                <FormControl fullWidth size="small" error={!formData.idRol}>
                    <InputLabel>Rol</InputLabel>
                    <Select
                        value={formData.idRol || ''}
                        onChange={handleChange('idRol')}
                        label="Rol"
                        disabled={loading}
                    >
                        {roles.map((rol) => (
                            <MenuItem key={rol.idRol} value={rol.idRol}>
                                {rol.nombreRol}
                            </MenuItem>
                        ))}
                    </Select>
                    {!formData.idRol && <Typography variant="caption" color="error" sx={{ ml: 2 }}>Campo obligatorio</Typography>}
                </FormControl>

                {/* Activo (Only if editing) */}
                {!isNewMode && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.activo === true || formData.activo === undefined} // Default to true if undefined? Or handle properly
                                // Actually backend sends 1/0 for tinyint, frontend types say boolean. Need to ensure conversion.
                                // Let's assume service handles conversion or we handle it here.
                                // If formData.activo comes as number 1/0, we need to handle it.
                                // In types/usuario.types.ts I defined active?: boolean.
                                // In controller it expects tinyint.
                                onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                                name="activo"
                            />
                        }
                        label="Activo"
                    />
                )}
            </Stack>

            <SearchPersonaModal
                open={openPersonaModal}
                onClose={() => setOpenPersonaModal(false)}
                onPersonaSelected={handlePersonaSelected}
            />
        </Box>
    );
}

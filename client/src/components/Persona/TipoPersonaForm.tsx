import { useState, useEffect } from 'react';
import {
    Divider,
    FormControlLabel,
    Stack,
    Typography,
    Checkbox,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import TextField from '../UppercaseTextField';
import type { Persona } from '../../types/persona.types';
import type { GrupoCliente } from '../../types/ubicacion.types';
import { ubicacionService } from '../../services/ubicacion.service';

/**
 * Props del componente TipoPersonaForm
 * Recibe los datos del formulario y la función para actualizarlos desde el componente padre
 */
interface TipoPersonaFormProps {
    formData: Persona;
    setFormData: React.Dispatch<React.SetStateAction<Persona>>;
}

/**
 * Componente que maneja los formularios específicos según el tipo de persona
 * - Persona Física: requiere apellido (eliminado), permite habilitar como personal
 * - Persona Jurídica: requiere nombre de fantasía, puede ser proveedor
 * - Cliente: requiere código (opcional, se autogenera si es 0) y grupo de clientes dinámico
 */
export const TipoPersonaForm = ({ formData, setFormData }: TipoPersonaFormProps) => {
    const [gruposCliente, setGruposCliente] = useState<GrupoCliente[]>([]);

    useEffect(() => {
        const cargarGrupos = async () => {
            try {
                const data = await ubicacionService.obtenerGruposCliente();
                setGruposCliente(data);
            } catch (error) {
                console.error('Error al cargar grupos de clientes:', error);
            }
        };
        cargarGrupos();
    }, []);

    /**
     * Función helper para manejar cambios en los campos del formulario
     */
    const handleChange = (field: keyof Persona) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    /**
     * Función para manejar cambios en los checkboxes de tipo de persona
     */
    const handleCheckboxChange = (field: keyof Persona) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: event.target.checked,
        }));
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Tipo de Persona
            </Typography>

            {/* Checkboxes para seleccionar los tipos de persona */}
            <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.tipoPersonaFis || false}
                            onChange={handleCheckboxChange('tipoPersonaFis')}
                            size="small"
                        />
                    }
                    label="Persona Física"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.tipoPersonaJur || false}
                            onChange={handleCheckboxChange('tipoPersonaJur')}
                            size="small"
                        />
                    }
                    label="Persona Jurídica"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.tipoPersonaCli || false}
                            onChange={handleCheckboxChange('tipoPersonaCli')}
                            size="small"
                        />
                    }
                    label="Cliente"
                />
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* Formulario para Persona Física - Checkbox Habilitar como Personal */}
            {formData.tipoPersonaFis && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                        Datos de Persona Física
                    </Typography>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.tipoPersonaPersonal || false}
                                onChange={handleCheckboxChange('tipoPersonaPersonal')}
                                size="small"
                            />
                        }
                        label="Habilitar como personal"
                    />
                </Box>
            )}

            {/* Formulario para Persona Jurídica */}
            {formData.tipoPersonaJur && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                        Datos de Persona Jurídica
                    </Typography>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            label="Nombre de Fantasía"
                            value={formData.nombreFantasia || ''}
                            onChange={handleChange('nombreFantasia')}
                            size="small"
                            required
                            error={formData.tipoPersonaJur && !formData.nombreFantasia}
                            helperText={formData.tipoPersonaJur && !formData.nombreFantasia ? 'Campo obligatorio para Persona Jurídica' : ''}
                        />

                        {/* Checkbox para marcar como Proveedor */}
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.tipoProveedor || false}
                                    onChange={handleCheckboxChange('tipoProveedor')}
                                    size="small"
                                />
                            }
                            label="Es Proveedor"
                        />

                        {/* Campos adicionales si es Proveedor */}
                        {formData.tipoProveedor && (
                            <Stack spacing={2} sx={{ pl: 4, borderLeft: '3px solid #1976d2' }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Datos de Proveedor
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Responsable del Proveedor"
                                    value={formData.responsableProveedor || ''}
                                    onChange={handleChange('responsableProveedor')}
                                    size="small"
                                />
                                <TextField
                                    fullWidth
                                    label="Timbrado"
                                    value={formData.timbrado || ''}
                                    onChange={handleChange('timbrado')}
                                    size="small"
                                />
                            </Stack>
                        )}
                    </Stack>
                </Box>
            )}

            {/* Formulario para Cliente */}
            {formData.tipoPersonaCli && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom color="primary">
                        Datos de Cliente
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            label="Código de Cliente"
                            value={formData.codigo || 0}
                            onChange={handleChange('codigo')}
                            size="small"
                            type="number"
                            sx={{ width: '200px' }}
                            helperText="Dejar en 0 para auto-generar"
                        />
                        <FormControl sx={{ width: '250px' }} size="small">
                            <InputLabel>Grupo de Cliente</InputLabel>
                            <Select
                                value={formData.idGrupoCliente || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    idGrupoCliente: e.target.value ? Number(e.target.value) : undefined
                                }))}
                                label="Grupo de Cliente"
                            >
                                <MenuItem value="">
                                    <em>Ninguno</em>
                                </MenuItem>
                                {gruposCliente.map((grupo) => (
                                    <MenuItem key={grupo.idGrupoCliente} value={grupo.idGrupoCliente}>
                                        {grupo.nombreGrupoCliente}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>
            )}

            {/* Mensaje de advertencia si no se selecciona ningún tipo */}
            {!formData.tipoPersonaFis && !formData.tipoPersonaJur && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                    * Debe seleccionar al menos un tipo de persona (Física o Jurídica)
                </Typography>
            )}
        </Box>
    );
};
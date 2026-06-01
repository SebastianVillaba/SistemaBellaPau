import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    FormControlLabel,
    Checkbox,
    Button,
    CircularProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { rolService } from '../../services/rol.service';
import type { Rol, PermisoConfiguracion } from '../../services/rol.service';

import RequirePermission from '../../components/RequirePermission';

const Roles = () => {
    // ... existing state and logic ...
    const [roles, setRoles] = useState<Rol[]>([]);
    const [selectedRol, setSelectedRol] = useState<number | ''>('');
    const [permisos, setPermisos] = useState<PermisoConfiguracion[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadRoles();
    }, []);

    useEffect(() => {
        if (selectedRol) {
            loadPermisos(selectedRol);
        } else {
            setPermisos([]);
        }
    }, [selectedRol]);

    const loadRoles = async () => {
        try {
            const data = await rolService.obtenerRoles();
            setRoles(data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar los roles.');
        }
    };

    const loadPermisos = async (idRol: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await rolService.obtenerConfiguracion(idRol);
            setPermisos(data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar los permisos del rol.');
        } finally {
            setLoading(false);
        }
    };

    const handlePermisoChange = (idPermiso: number) => {
        setPermisos(prev => prev.map(p =>
            p.idPermiso === idPermiso ? { ...p, tienePermiso: !p.tienePermiso } : p
        ));
    };

    const handleSave = async () => {
        if (!selectedRol) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        const permisosSeleccionados = permisos
            .filter(p => p.tienePermiso)
            .map(p => p.idPermiso);

        try {
            await rolService.guardarConfiguracion({
                idRol: selectedRol,
                permisos: permisosSeleccionados
            });
            setSuccess('Configuración guardada exitosamente.');
        } catch (err) {
            console.error(err);
            setError('Error al guardar la configuración.');
        } finally {
            setSaving(false);
        }
    };

    // Agrupar permisos por módulo
    const permisosPorModulo = permisos.reduce((acc, curr) => {
        if (!acc[curr.modulo]) {
            acc[curr.modulo] = [];
        }
        acc[curr.modulo].push(curr);
        return acc;
    }, {} as Record<string, PermisoConfiguracion[]>);

    return (
        <RequirePermission permission="ACCESO_SEGURIDAD">
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Administración de Roles y Permisos
                </Typography>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="rol-select-label">Seleccionar Rol</InputLabel>
                                <Select
                                    labelId="rol-select-label"
                                    value={selectedRol}
                                    label="Seleccionar Rol"
                                    onChange={(e) => setSelectedRol(e.target.value as number)}
                                >
                                    {roles.map((rol) => (
                                        <MenuItem key={rol.idRol} value={rol.idRol}>
                                            {rol.nombreRol}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    selectedRol && (
                        <Box>
                            {Object.entries(permisosPorModulo).map(([modulo, listaPermisos]) => (
                                <Accordion key={modulo} defaultExpanded>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6">{modulo}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            {listaPermisos.map((permiso) => (
                                                <Grid item xs={12} sm={6} md={4} key={permiso.idPermiso}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={permiso.tienePermiso}
                                                                onChange={() => handlePermisoChange(permiso.idPermiso)}
                                                            />
                                                        }
                                                        label={permiso.descripcion}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            ))}

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                                </Button>
                            </Box>
                        </Box>
                    )
                )}
            </Box>
        </RequirePermission>
    );
};

export default Roles;

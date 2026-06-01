import { useState } from 'react';
import { personaService } from '../../services/persona.service';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
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
import type { Persona } from '../../types/persona.types';
import PersonaForm from '../../components/Persona/PersonaForm';

export default function PersonasABM(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchBy, setSearchBy] = useState<1 | 2 | 3>(1);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isNewMode, setIsNewMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<Persona>({
    nombre: '',
    idUsuarioAlta: 1, // TODO: Obtener del usuario logueado
    tipoPersonaJur: false,
    tipoProveedor: false,
    tipoPersonaFis: false,
    tipoPersonaCli: false,
    tipoPersonaPersonal: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Ingrese un término de búsqueda');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const results = await personaService.buscarPersonas(searchTerm, searchBy);
      setPersonas((results as any).result || []);
    } catch (err: any) {
      console.error('Error al buscar personas:', err);
      setError(err.message || 'Error al buscar personas');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPersona = async (persona: Persona) => {
    setLoading(true);
    setError('');

    try {
      // Obtener información detallada de la persona seleccionada
      const personaInfo = await personaService.obtenerInfoPersona(persona.idPersona!);

      // Usar el primer resultado (debería haber solo uno)
      const infoCompleta = personaInfo[0];

      // Mapear la información completa al formato del formulario
      const personaMapeada: Persona = {
        idPersona: infoCompleta.idPersona,
        nombre: infoCompleta.nombre,
        ruc: infoCompleta.ruc,
        dv: infoCompleta.dv?.toString(),
        direccion: infoCompleta.direccion,
        // Campos de ubicación
        idDepartamento: infoCompleta.idDepartamento,
        idDistrito: infoCompleta.idDistrito,
        idCiudad: infoCompleta.idCiudad?.toString(),
        idPais: infoCompleta.idPais || 1,
        telefono: infoCompleta.telefono,
        celular: infoCompleta.celular,
        email: infoCompleta.email,
        idTipoDocumento: infoCompleta.idTipoDocumento,
        fechaNacimiento: infoCompleta.fechaNacimiento ? new Date(infoCompleta.fechaNacimiento).toISOString().split('T')[0] : '',
        nombreFantasia: infoCompleta.nombreFantasia || '',
        responsableProveedor: infoCompleta.responsable || '',
        timbrado: infoCompleta.timbrado || '',
        codigo: infoCompleta.codigo,
        idGrupoCliente: infoCompleta.idGrupoCliente,
        tipoPersonaJur: !!infoCompleta.nombreFantasia, // Si tiene nombreFantasia es Jurídica
        tipoProveedor: !!infoCompleta.responsable, // Si tiene responsable es Proveedor
        tipoPersonaFis: !infoCompleta.nombreFantasia, // Si no tiene nombreFantasia es Física
        tipoPersonaCli: !!infoCompleta.codigo, // Si tiene código es Cliente
        tipoPersonaPersonal: !!infoCompleta.idPersonal, // Si tiene idPersonal es Personal
        idUsuarioAlta: 1, // TODO: Obtener del usuario logueado
      };
      setSelectedPersona(personaMapeada);
      setFormData(personaMapeada);
      setIsNewMode(false);
    } catch (err: any) {
      console.error('Error al obtener información de la persona:', err);
      setError(err.message || 'Error al obtener información de la persona');
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setIsNewMode(true);
    setSelectedPersona(null);
    setError('');
    setFormData({
      nombre: '',
      ruc: '',
      dv: '',
      direccion: '',
      telefono: '',
      celular: '',
      email: '',
      fechaNacimiento: '',
      idUsuarioAlta: 1, // TODO: Obtener del usuario logueado
      nombreFantasia: '',
      codigo: 0,
      tipoPersonaJur: false,
      tipoProveedor: false,
      responsableProveedor: '',
      timbrado: '',
      tipoPersonaFis: false,
      tipoPersonaCli: false,
      tipoPersonaPersonal: false,
    });
  };

  const handleSave = async () => {
    setError('');

    // VALIDACIONES
    // 1. Validar nombre obligatorio
    if (!formData.nombre || formData.nombre.trim() === '') {
      setError('El nombre y apellido / razón social es obligatorio');
      return;
    }

    // 2. Validar que al menos un tipo de persona esté seleccionado
    if (!formData.tipoPersonaFis && !formData.tipoPersonaJur) {
      setError('Debe seleccionar al menos un tipo de persona (Física o Jurídica)');
      return;
    }

    // 3. Validar campos específicos según tipo de persona
    if (formData.tipoPersonaJur && (!formData.nombreFantasia || formData.nombreFantasia.trim() === '')) {
      setError('El nombre de fantasía es obligatorio para Persona Jurídica');
      return;
    }

    // 4. Convertir fecha si existe (de YYYY-MM-DD a DD/MM/YYYY para el API)
    let fechaFormateada = '';
    if (formData.fechaNacimiento) {
      const fecha = new Date(formData.fechaNacimiento);
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const anio = fecha.getFullYear();
      fechaFormateada = `${dia}/${mes}/${anio}`;
    }

    try {
      setLoading(true);

      if (isNewMode) {
        // Crear nueva persona
        const dataToSend = {
          ...formData,
          fechaNacimiento: fechaFormateada,
          codigo: formData.codigo || 0,
        };

        console.log('Enviando datos al API:', dataToSend);

        const response = await personaService.insertarPersona(dataToSend);

        alert(`✓ ${response.message}`);
        handleCancel();
      } else {
        // Actualizar persona existente
        const dataToSend = {
          ...formData,
          fechaNacimiento: fechaFormateada,
          idUsuarioMod: 1, // TODO: Obtener del usuario logueado
          activo: 1
        };
        const response = await personaService.modificarPersona(dataToSend);
        alert(`✓ ${response.message}`);
        handleCancel();
      }
    } catch (err: any) {
      console.error('Error al guardar persona:', err);
      setError(err.message || 'Error al guardar la persona');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsNewMode(false);
    setSelectedPersona(null);
    setError('');
    setFormData({
      nombre: '',
      idUsuarioAlta: 1,
      tipoPersonaJur: false,
      tipoProveedor: false,
      tipoPersonaFis: false,
      tipoPersonaCli: false,
      tipoPersonaPersonal: false,
    });
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', gap: 2 }}>
      {/* Panel de búsqueda lateral */}
      <Paper sx={{ width: 320, p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Búsqueda
        </Typography>

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Ordenar</FormLabel>
          <RadioGroup
            row
            value={searchBy.toString()}
            onChange={(e) => setSearchBy(parseInt(e.target.value, 10) as 1 | 2 | 3)}
          >
            <FormControlLabel value="1" control={<Radio size="small" />} label="Nombre" />
            <FormControlLabel value="2" control={<Radio size="small" />} label="Código" />
            <FormControlLabel value="3" control={<Radio size="small" />} label="RUC" />
          </RadioGroup>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar..."
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
            {personas.map((persona) => (
              <ListItem key={persona.idPersona} disablePadding>
                <ListItemButton
                  selected={selectedPersona?.idPersona === persona.idPersona}
                  onClick={() => handleSelectPersona(persona)}
                >
                  <ListItemText
                    primary={persona.nombre}
                    secondary={`RUC: ${persona.ruc || 'N/A'}`}
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
            {isNewMode ? 'Nueva Persona' : selectedPersona ? 'Editar Persona' : 'Persona-Entidad'}
          </Typography>
        </Box>

        {/* Mostrar errores si existen */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Mostrar indicador de carga */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {(isNewMode || selectedPersona) ? (
          <Box>
            <PersonaForm formData={formData} setFormData={setFormData} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60%' }}>
            <Typography variant="h6" color="text.secondary">
              Seleccione una persona o haga clic en "Nuevo" para comenzar
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

          {(isNewMode || selectedPersona) && (
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
  );
}

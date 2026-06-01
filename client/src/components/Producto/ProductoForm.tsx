import {
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  Stack,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import TextField from '../UppercaseTextField';
import { useState, useEffect } from 'react';
import type { Producto, TipoProducto } from '../../types/producto.types';
import { productoService } from '../../services/producto.service';
import { impuestoService } from '../../services/impuesto.service';

interface ProductoFormProps {
  formData: Producto;
  setFormData: React.Dispatch<React.SetStateAction<Producto>>;
}

export default function ProductoForm({ formData, setFormData }: ProductoFormProps): JSX.Element {
  const [tiposProducto, setTiposProducto] = useState<TipoProducto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [impuestos, setImpuestos] = useState<any[]>([]);

  console.log(formData);
  

  useEffect(() => {
    const fetchTiposProducto = async () => {
      setLoading(true);
      try {
        const tipos = await productoService.obtenerTiposProducto();
        setTiposProducto(tipos);
      } catch (error) {
        console.error('Error al cargar tipos de producto:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchImpuesto = async () => {
      setLoading(true);
      try {
        const tipos = await impuestoService.consultaImpuesto();
        setImpuestos(tipos);
      } catch (error) {
        console.error('Error al cargar tipos de producto:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTiposProducto();
    fetchImpuesto();
  }, []);

  const handleChange = (field: keyof Producto) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box>
      <Typography variant="caption" color="error" sx={{ my: 2, display: 'block' }}>
        * Datos Obligatorios
      </Typography>
      <Stack spacing={2.5}>
        {/* Fila 1: ID y Nombre */}
        <Stack direction="column" spacing={2}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <TextField
              label="ID Producto"
              value={formData.idProducto || ''}
              disabled
              size="small"
              sx={{ width: '150px' }}
            />
            <TextField
              label="Costo"
              value={formData.costo || ''}
              disabled
              size="small"
              sx={{ width: '150px' }}
            />
          </Box>
          <TextField
            fullWidth
            label="Nombre"
            value={formData.nombre}
            onChange={handleChange('nombre')}
            required
            size="small"
            error={!formData.nombre}
            helperText={!formData.nombre ? 'Campo obligatorio' : ''}
          />
        </Stack>

        {/* Fila 2: Presentación y Código */}
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label="Presentación"
            value={formData.presentacion}
            onChange={handleChange('presentacion')}
            size="small"
            helperText={!formData.presentacion}
          />
          <TextField
            fullWidth
            label="Código"
            value={formData.codigo}
            onChange={handleChange('codigo')}
            size="small"
            helperText={''}
          />
        </Stack>

        {/* Fila 3: Código de Barra */}
        <TextField
          fullWidth
          label="Código de Barra"
          value={formData.codigoBarra}
          onChange={handleChange('codigoBarra')}
          size="small"
        />

        {/* Fila 4: Precio */}
        <TextField
          fullWidth
          label="Precio"
          type="number"
          value={formData.precio}
          onChange={handleChange('precio')}
          required
          size="small"
          error={formData.precio <= 0}
          helperText={formData.precio <= 0 ? 'Precio debe ser mayor a 0' : ''}
          inputProps={{ min: 0, step: 0.01 }}
        />

        {/* Fila 5: Tipo de Producto */}
        <FormControl fullWidth size="small">
          <InputLabel>Tipo de Producto</InputLabel>
          <Select
            value={formData.idTipoProducto || ''}
            onChange={handleChange('idTipoProducto')}
            label="Tipo de Producto"
            disabled={loading}
          >
            {tiposProducto.map((tipo) => (
              <MenuItem key={tipo.idTipoProducto} value={tipo.idTipoProducto}>
                {tipo.nombreTipo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Fila 6: Impuesto */}
        <FormControl fullWidth size="small">
          <InputLabel>Impuesto</InputLabel>
          <Select
            value={formData.idImpuesto || ''}
            onChange={handleChange('idImpuesto')}
            label="Impuesto"
            disabled={loading}
          >
            {impuestos.map((impuesto) => (
              <MenuItem key={impuesto.idImpuesto} value={impuesto.idImpuesto}>
                {impuesto.nombreImpuesto}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Fila 7: Gasto */}
        {/* Fila 7: Checkboxes */}
        <Stack direction="row" spacing={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.gasto || false}
                onChange={handleChange('gasto')}
                name="gasto"
              />
            }
            label="Es Gasto"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.activo !== undefined ? formData.activo : true}
                onChange={handleChange('activo')}
                name="activo"
              />
            }
            label="Activo"
          />
        </Stack>

        {/* Fila 8: Origen */}
        <FormControl fullWidth size="small">
          <InputLabel>Origen</InputLabel>
          <Select
            value={formData.origen ? 1 : 0}
            label="Origen"
            onChange={(e) => {
              const val = Number(e.target.value);
              setFormData(prev => ({ ...prev, origen: val === 1 }));
            }}
          >
            <MenuItem value={0}>Importado</MenuItem>
            <MenuItem value={1}>Nacional</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
}

import { useState } from 'react';
import { productoService } from '../../services/producto.service';
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
import type { Producto } from '../../types/producto.types';
import ProductoForm from '../../components/Producto/ProductoForm';

export default function ProductosABM(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchBy, setSearchBy] = useState<1 | 2 | 3>(1);
  const [productos, setProductos] = useState<any[]>([]);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isNewMode, setIsNewMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<Producto>({
    nombre: '',
    presentacion: '',
    codigo: '',
    codigoBarra: '',
    precio: 0,
    costo: 0,
    idTipoProducto: 0,
    idUsuarioAlta: 1, // TODO: Obtener del usuario logueado
    gasto: false,
    idImpuesto: 0,
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
      const results = await productoService.buscarProductos(searchTerm, searchBy);
      setProductos(results.result);
    } catch (err: any) {
      console.error('Error al buscar productos:', err);
      setError(err.message || 'Error al buscar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProducto = async (producto: Producto) => {
    setLoading(true);
    setError('');

    try {
      // Obtener información detallada del producto seleccionado
      const productoInfo = await productoService.obtenerInfoProducto(producto.idProducto!);

      // Usar el primer resultado (debería haber solo uno)
      const infoCompleta = productoInfo[0];

      // Mapear la información completa al formato del formulario
      const productoMapeado: Producto = {
        idProducto: infoCompleta.idProducto,
        nombre: infoCompleta.nombre,
        presentacion: infoCompleta.presentacion,
        codigo: infoCompleta.codigo,
        codigoBarra: infoCompleta.codigoBarra,
        precio: infoCompleta.precio,
        costo: infoCompleta.costo,
        idTipoProducto: infoCompleta.idTipoProducto,
        gasto: infoCompleta.gasto || false,
        idImpuesto: infoCompleta.idImpuesto || 0,
        origen: infoCompleta.origen || false, 
        activo: infoCompleta.activo || true,
      };

      setSelectedProducto(productoMapeado);
      setFormData(productoMapeado);
      setIsNewMode(false);
    } catch (err: any) {
      console.error('Error al obtener información del producto:', err);
      setError(err.message || 'Error al obtener información del producto');
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setIsNewMode(true);
    setSelectedProducto(null);
    setError('');
    setFormData({
      nombre: '',
      presentacion: '',
      codigo: '',
      codigoBarra: '',
      precio: 0,
      costo: 0,
      idTipoProducto: 0,
      idUsuarioAlta: 1, // TODO: Obtener del usuario logueado
      gasto: false,
      idImpuesto: 0,
    });
  };

  const handleSave = async () => {
    // Limpiar errores previos
    setError('');

    // VALIDACIONES
    // 1. Validar nombre obligatorio
    if (!formData.nombre || formData.nombre.trim() === '') {
      setError('El nombre es obligatorio');
      return;
    }

    // 4. Validar precio mayor a 0
    if (formData.precio <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    // 6. Validar tipo de producto seleccionado
    if (!formData.idTipoProducto || formData.idTipoProducto <= 0) {
      setError('Debe seleccionar un tipo de producto');
      return;
    }

    try {
      setLoading(true);

      if (isNewMode) {
        // Crear nuevo producto
        const dataToSend = {
          ...formData,
          idUsuarioAlta: 1, // TODO: Obtener del usuario logueado
        };
        const response = await productoService.insertarProducto(dataToSend);

        alert(`✓ ${response.message}`);

        // Limpiar formulario y volver al estado inicial
        handleCancel();

        // Opcional: Recargar la lista de productos
        // handleSearch();
      } else {
        // Actualizar producto existente
        const dataToSend = {
          ...formData,
          idUsuarioMod: 1, // TODO: Obtener del usuario logueado
          activo: true
        };
        const response = await productoService.modificarProducto(dataToSend);
        alert(`✓ ${response.message}`);
        handleCancel();
        // handleSearch();
      }
    } catch (err: any) {
      console.error('Error al guardar producto:', err);
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsNewMode(false);
    setSelectedProducto(null);
    setError('');
    setFormData({
      nombre: '',
      presentacion: '',
      codigo: '',
      codigoBarra: '',
      precio: 0,
      costo: 0,
      idTipoProducto: 0,
      idUsuarioAlta: 1,
      gasto: false,
      idImpuesto: 0,
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
            <FormControlLabel value="3" control={<Radio size="small" />} label="Código Barra" />
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
            {productos.map((producto) => (
              <ListItem key={producto.idProducto} disablePadding>
                <ListItemButton
                  selected={selectedProducto?.idProducto === producto.idProducto}
                  onClick={() => handleSelectProducto(producto)}
                >
                  <ListItemText
                    primary={producto.nombreMercaderia}
                    secondary={`Código: ${producto.codigo}`}
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
            {isNewMode ? 'Nuevo Producto' : selectedProducto ? 'Editar Producto' : 'Producto'}
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

        {(isNewMode || selectedProducto) ? (
          <ProductoForm formData={formData} setFormData={setFormData} />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60%' }}>
            <Typography variant="h6" color="text.secondary">
              Seleccione un producto o haga clic en "Nuevo" para comenzar
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

          {(isNewMode || selectedProducto) && (
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

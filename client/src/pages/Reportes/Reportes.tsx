import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Divider,
  Box
} from '@mui/material';
import PictureAsPdfIcon from '@mui/material/Icon'; // or explicit import if configured
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

// Si el backend corre en un puerto diferente (ej. 4000), podemos obtenerlo de la variable de entorno o ponerlo fijo temporalmente
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const Reportes: React.FC = () => {
  // Estado para la fecha del reporte de Ventas por Producto
  const [fechaVentasProducto, setFechaVentasProducto] = useState<string>(
    new Date().toISOString().split('T')[0] // Hoy por defecto (YYYY-MM-DD)
  );

  const handleDescargarVentasProducto = async () => {
    try {
      if (!fechaVentasProducto) {
        alert('Por favor selecciona una fecha');
        return;
      }

      // Descargamos usando window.open o con fetch para manejar el Blob
      const url = `${API_URL}/reporte/venta-producto-dia?fecha=${fechaVentasProducto}&format=pdf`;
      window.open(url, '_blank');
      
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      alert('Error al generar el reporte');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Zona de Reportes
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Seleccione el reporte que desea generar y configure los parámetros correspondientes.
      </Typography>

      <Grid container spacing={4}>
        
        {/* REPORTE: Ventas de Producto por Día */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Reporte de Ventas por Producto
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" sx={{ mb: 3 }} color="textSecondary">
                Genera un informe en PDF detallando las cantidades vendidas y montos totales por producto en una fecha especificada.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField 
                  label="Fecha del Reporte" 
                  type="date" 
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={fechaVentasProducto}
                  onChange={(e) => setFechaVentasProducto(e.target.value)}
                />
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<DownloadIcon />}
                  onClick={handleDescargarVentasProducto}
                  fullWidth
                >
                  Generar PDF
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Aquí podemos agregar más tarjetas (cards) para futuros reportes fácilmente */}
        {/* 
        <Grid item xs={12} md={6}>
          <Card elevation={3}> ... </Card> 
        </Grid> 
        */}

      </Grid>
    </Container>
  );
};

export default Reportes;

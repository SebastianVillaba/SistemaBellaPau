import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import TextField from './UppercaseTextField';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { gastoService } from '../services/gasto.service';

interface GastoModalProps {
  open: boolean;
  onClose: () => void;
  onGastoAgregado: () => void;
}

const GastoModal: React.FC<GastoModalProps> = ({ open, onClose, onGastoAgregado }) => {
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGuardar = async () => {
    // Validaciones
    if (!concepto.trim()) {
      setError('El concepto es obligatorio');
      return;
    }

    const montoNumerico = parseFloat(monto);
    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      setError('El monto debe ser un número mayor a 0');
      return;
    }

    const idMovimientoCaja = localStorage.getItem('idMovimientoCaja');
    const idUsuario = localStorage.getItem('idUsuario') || '1';

    if (!idMovimientoCaja) {
      setError('No hay una caja abierta');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await gastoService.agregarGasto({
        idMovimientoCaja: parseInt(idMovimientoCaja),
        idUsuario: parseInt(idUsuario),
        concepto: concepto.trim(),
        montoGasto: montoNumerico
      });

      setSuccess('Gasto agregado exitosamente');

      // Limpiar formulario
      setTimeout(() => {
        setConcepto('');
        setMonto('');
        setSuccess('');
        onGastoAgregado();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error al agregar gasto:', err);
      setError(err.message || 'Error al agregar gasto');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setConcepto('');
    setMonto('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancelar} maxWidth="sm" fullWidth>
      <DialogTitle>Agregar Gasto</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Concepto del Gasto"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
          margin="normal"
          placeholder="Ej: Compra de insumos, pago de servicios, etc."
          multiline
          rows={2}
          disabled={loading}
        />

        <TextField
          fullWidth
          label="Monto"
          value={monto}
          onChange={(e) => {
            const value = e.target.value;
            // Solo permitir números y punto decimal
            if (value === '' || /^\d*\.?\d*$/.test(value)) {
              setMonto(value);
            }
          }}
          margin="normal"
          type="text"
          InputProps={{
            startAdornment: <InputAdornment position="start">₲</InputAdornment>,
          }}
          placeholder="0.00"
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelar} startIcon={<CancelIcon />} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={loading}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GastoModal;

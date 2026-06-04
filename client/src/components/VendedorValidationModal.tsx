import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import TextField from './UppercaseTextField';
import { usuarioService } from '../services/usuario.service';
import LockOpenIcon from '@mui/icons-material/LockOpen';

interface VendedorValidationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (idVendedor: number, nombre: string) => void;
}

const VendedorValidationModal: React.FC<VendedorValidationModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when opening modal
  useEffect(() => {
    if (open) {
      setPassword('');
      setError('');
      setLoading(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  const handleAuthenticate = async () => {
    if (!password) {
      setError('Por favor ingrese la contraseña.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await usuarioService.validarVendedor(password);
      if (response.success && response.result) {
        onSuccess(response.result.idVendedor, response.result.nombre);
      } else {
        setError(response.message || 'Error de autenticación.');
      }
    } catch (err: any) {
      console.error('Error during seller authentication:', err);
      const errMsg = err.response?.data?.message || 'Usted no está habilitado/a como Vendedor/a en el Sistema..';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 8,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Box sx={{ p: 1.5, backgroundColor: '#fbe9e7', borderRadius: '50%', color: 'error.main', display: 'flex' }}>
            <LockOpenIcon fontSize="large" />
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
            Autorización de Vendedor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Se requiere validación de credenciales para guardar la venta.
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Contraseña de Vendedor"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAuthenticate();
              }
            }}
            inputRef={inputRef}
            placeholder="••••••••"
            disabled={loading}
            InputProps={{
              sx: {
                fontSize: '1.25rem',
                textAlign: 'center',
                letterSpacing: '0.2em'
              }
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          onClick={handleAuthenticate}
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          disabled={loading}
          sx={{ py: 1.5, fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Autenticar y Finalizar'}
        </Button>
        <Button
          onClick={onClose}
          variant="text"
          color="inherit"
          fullWidth
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VendedorValidationModal;

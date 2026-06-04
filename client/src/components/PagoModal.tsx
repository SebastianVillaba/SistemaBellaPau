import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import TextField from './UppercaseTextField';
import { cotizacionService } from '../services/cotizacion.service';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

interface PagoModalProps {
  open: boolean;
  totalVenta: number;
  onClose: () => void;
  onConfirm: (amounts: {
    montoGs: number;
    montoDolar: number;
    montoReal: number;
    montoPeso: number;
  }) => void;
}

const PagoModal: React.FC<PagoModalProps> = ({
  open,
  totalVenta,
  onClose,
  onConfirm,
}) => {
  // Payment states
  const [montoGs, setMontoGs] = useState<string>('');
  const [montoDolar, setMontoDolar] = useState<string>('');
  const [montoReal, setMontoReal] = useState<string>('');
  const [montoPeso, setMontoPeso] = useState<string>('');

  // Exchange rates from backend
  const [rates, setRates] = useState<{ [key: string]: number }>({
    GS: 1,
    USD: 6300,
    RS: 1600, // Real brasileño is labeled as RS in DB
    ARS: 4.65
  });

  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch real rates when modal opens
  useEffect(() => {
    if (open) {
      setMontoGs('');
      setMontoDolar('');
      setMontoReal('');
      setMontoPeso('');
      
      const fetchRates = async () => {
        try {
          const result = await cotizacionService.getCotizaciones();
          const map: { [key: string]: number } = {};
          result.forEach((item) => {
            map[item.simbolo.toUpperCase()] = item.cotizacion;
          });
          if (map.GS) {
            setRates(map);
          }
        } catch (error) {
          console.error('Error fetching rates in PagoModal:', error);
        }
      };
      fetchRates();
    }
  }, [open]);

  // Numeric parsing helper
  const parseNum = (val: string): number => {
    const parsed = parseFloat(val);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  };

  // Conversions to Gs.
  const valGs = parseNum(montoGs);
  const valDolar = parseNum(montoDolar) * (rates.USD || 6787);
  const valReal = parseNum(montoReal) * (rates.RS || 1600);
  const valPeso = parseNum(montoPeso) * (rates.ARS || 4.65);

  const totalPaidGs = valGs + valDolar + valReal + valPeso;
  const difference = totalPaidGs - totalVenta;
  
  const vuelto = difference >= 0 ? difference : 0;
  const faltante = difference < 0 ? -difference : 0;

  // Auto-complete feature for a specific currency
  const handleAutoComplete = (currency: 'GS' | 'USD' | 'RS' | 'ARS') => {
    // Current total paid excluding the one we want to auto-complete
    let paidExcludingCurrent = 0;
    if (currency !== 'GS') paidExcludingCurrent += valGs;
    if (currency !== 'USD') paidExcludingCurrent += valDolar;
    if (currency !== 'RS') paidExcludingCurrent += valReal;
    if (currency !== 'ARS') paidExcludingCurrent += valPeso;

    const remainingGs = Math.max(0, totalVenta - paidExcludingCurrent);
    if (remainingGs <= 0) return;

    const rate = rates[currency] || 1;
    let exactAmount = remainingGs / rate;

    // Standard rounding helper (integers for Gs, decimals for others)
    if (currency === 'GS') {
      exactAmount = Math.ceil(exactAmount);
      setMontoGs(exactAmount.toString());
    } else if (currency === 'USD') {
      // 2 decimals for foreign
      setMontoDolar((Math.round(exactAmount * 100) / 100).toString());
    } else if (currency === 'RS') {
      setMontoReal((Math.round(exactAmount * 100) / 100).toString());
    } else if (currency === 'ARS') {
      setMontoPeso((Math.round(exactAmount * 100) / 100).toString());
    }
  };

  const handleConfirm = () => {
    if (totalPaidGs < totalVenta) {
      alert('El monto pagado es menor al total de la venta.');
      return;
    }

    onConfirm({
      montoGs: parseNum(montoGs),
      montoDolar: parseNum(montoDolar),
      montoReal: parseNum(montoReal),
      montoPeso: parseNum(montoPeso),
    });
  };

  const formatCurrency = (value: number, isGs: boolean = true) => {
    return value.toLocaleString('es-PY', {
      minimumFractionDigits: isGs ? 0 : 2,
      maximumFractionDigits: isGs ? 0 : 2
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 8,
          background: 'linear-gradient(to bottom, #ffffff, #fcfcfc)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #eee' }}>
        <Typography variant="h5" component="div" fontWeight="bold" color="primary.main">
          💵 Registro de Pago Multidivisa
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ingrese los montos recibidos. Puede combinar múltiples monedas.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* LEFT SIDE: Inputs for Currencies */}
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Detalle de Montos Recibidos:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Guaraníes (Gs) */}
              <Paper variant="outlined" sx={{ p: 1.5, position: 'relative', borderRadius: 2 }}>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Monto en Guaraníes (Gs.)"
                      type="number"
                      size="medium"
                      value={montoGs}
                      onChange={(e) => setMontoGs(e.target.value)}
                      placeholder="0"
                      autoFocus
                      inputProps={{ min: 0 }}
                      InputProps={{
                        sx: { fontWeight: 'bold' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Equivalente Gs.
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      ₲ {formatCurrency(valGs, true)}
                    </Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: 'center' }}>
                    <Tooltip title="Completar saldo restante en Guaraníes">
                      <IconButton color="primary" onClick={() => handleAutoComplete('GS')}>
                        <AutoFixHighIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Paper>

              {/* Dólares (USD) */}
              <Paper variant="outlined" sx={{ p: 1.5, position: 'relative', borderRadius: 2 }}>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Monto en Dólares (USD)"
                      type="number"
                      size="medium"
                      value={montoDolar}
                      onChange={(e) => setMontoDolar(e.target.value)}
                      placeholder="0.00"
                      inputProps={{ min: 0, step: 0.01 }}
                      InputProps={{
                        sx: { fontWeight: 'bold' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Equivalente Gs. (@ {formatCurrency(rates.USD || 6787, true)})
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      ₲ {formatCurrency(valDolar, true)}
                    </Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: 'center' }}>
                    <Tooltip title="Completar saldo restante en Dólares">
                      <IconButton color="primary" onClick={() => handleAutoComplete('USD')}>
                        <AutoFixHighIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Paper>

              {/* Reales (BRL) */}
              <Paper variant="outlined" sx={{ p: 1.5, position: 'relative', borderRadius: 2 }}>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Monto en Reales (BRL)"
                      type="number"
                      size="medium"
                      value={montoReal}
                      onChange={(e) => setMontoReal(e.target.value)}
                      placeholder="0.00"
                      inputProps={{ min: 0, step: 0.01 }}
                      InputProps={{
                        sx: { fontWeight: 'bold' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Equivalente Gs. (@ {formatCurrency(rates.RS || 1600, true)})
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      ₲ {formatCurrency(valReal, true)}
                    </Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: 'center' }}>
                    <Tooltip title="Completar saldo restante en Reales">
                      <IconButton color="primary" onClick={() => handleAutoComplete('RS')}>
                        <AutoFixHighIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Paper>

              {/* Pesos (ARS) */}
              <Paper variant="outlined" sx={{ p: 1.5, position: 'relative', borderRadius: 2 }}>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Monto en Pesos (ARS)"
                      type="number"
                      size="medium"
                      value={montoPeso}
                      onChange={(e) => setMontoPeso(e.target.value)}
                      placeholder="0.00"
                      inputProps={{ min: 0, step: 0.01 }}
                      InputProps={{
                        sx: { fontWeight: 'bold' }
                      }}
                    />
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Equivalente Gs. (@ {rates.ARS || 4.65})
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      ₲ {formatCurrency(valPeso, true)}
                    </Typography>
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: 'center' }}>
                    <Tooltip title="Completar saldo restante en Pesos">
                      <IconButton color="primary" onClick={() => handleAutoComplete('ARS')}>
                        <AutoFixHighIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Grid>

          {/* RIGHT SIDE: Summaries and Totals */}
          <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Resumen de Cobro (Base Gs.):
            </Typography>

            {/* Total to Pay */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total a Pagar:
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #bbdefb',
                  borderRadius: 2,
                  textAlign: 'right'
                }}
              >
                <Typography variant="h4" fontWeight="extrabold" color="primary.main">
                  ₲ {formatCurrency(totalVenta, true)}
                </Typography>
              </Paper>
            </Box>

            {/* Total Paid */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Recibido:
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: '#e8f5e9',
                  border: '1px solid #c8e6c9',
                  borderRadius: 2,
                  textAlign: 'right'
                }}
              >
                <Typography variant="h4" fontWeight="extrabold" color="success.main">
                  ₲ {formatCurrency(totalPaidGs, true)}
                </Typography>
              </Paper>
            </Box>

            {/* Difference / Balance */}
            <Box>
              {totalPaidGs >= totalVenta ? (
                <>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Vuelto:
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: '#fff9c4',
                      border: '1px solid #fff59d',
                      borderRadius: 2,
                      textAlign: 'right'
                    }}
                  >
                    <Typography variant="h4" fontWeight="extrabold" color="brown">
                      ₲ {formatCurrency(vuelto, true)}
                    </Typography>
                  </Paper>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Faltante:
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: '#ffebee',
                      border: '1px solid #ffcdd2',
                      borderRadius: 2,
                      textAlign: 'right'
                    }}
                  >
                    <Typography variant="h4" fontWeight="extrabold" color="error.main">
                      ₲ {formatCurrency(faltante, true)}
                    </Typography>
                  </Paper>
                </>
              )}
            </Box>

            {/* Verification Alert */}
            {totalPaidGs >= totalVenta ? (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                Cobro cubierto en su totalidad. Puede proceder a finalizar.
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                Falta cubrir ₲ {formatCurrency(faltante, true)} para completar el pago.
              </Alert>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #eee', gap: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="inherit"
          sx={{ px: 4, py: 1.5, borderRadius: 2 }}
        >
          Cancelar
        </Button>
        <Button
          ref={confirmButtonRef}
          onClick={handleConfirm}
          variant="contained"
          color="success"
          size="large"
          disabled={totalPaidGs < totalVenta}
          sx={{ px: 6, py: 1.5, fontWeight: 'bold', borderRadius: 2, flex: 1 }}
        >
          Confirmar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PagoModal;

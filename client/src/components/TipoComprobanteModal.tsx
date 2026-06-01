import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DescriptionIcon from '@mui/icons-material/Description';

interface TipoComprobanteModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTipo: (esTicket: boolean) => void;
}

const TipoComprobanteModal: React.FC<TipoComprobanteModalProps> = ({
  open,
  onClose,
  onSelectTipo,
}) => {
  const handleSelectTicket = () => {
    onSelectTipo(true); // ticket = 1
  };

  const handleSelectFactura = () => {
    onSelectTipo(false); // ticket = 0
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" component="div" fontWeight="bold">
          Seleccionar Tipo de Comprobante
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 3, py: 3, justifyContent: 'center' }}>
          {/* Botón Ticket */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSelectTicket}
            sx={{
              flex: 1,
              py: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.2s'
              }
            }}
          >
            <ReceiptIcon sx={{ fontSize: 60 }} />
            Ticket
          </Button>

          {/* Botón Factura */}
          <Button
            variant="contained"
            color="success"
            onClick={handleSelectFactura}
            sx={{
              flex: 1,
              py: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.2s'
              }
            }}
          >
            <DescriptionIcon sx={{ fontSize: 60 }} />
            Factura
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TipoComprobanteModal;

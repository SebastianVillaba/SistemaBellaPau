import { Box, Paper, Typography, Button, Alert } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from 'react';

interface TerminalNotEnabledProps {
  token: string;
}

const TerminalNotEnabled = ({ token }: TerminalNotEnabledProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 600,
          width: '100%',
          padding: 4,
          textAlign: 'center',
        }}
      >
        <WarningAmberIcon
          sx={{
            fontSize: 80,
            color: 'warning.main',
            marginBottom: 2,
          }}
        />
        
        <Typography variant="h4" gutterBottom fontWeight="bold" color="error">
          ¡Este puesto no está habilitado!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ marginBottom: 3 }}>
          Esta terminal no tiene permisos para acceder al sistema. 
          Por favor, pasa el siguiente token a un administrador para que te añada.
        </Typography>

        <Alert severity="info" sx={{ marginBottom: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            Token de Terminal:
          </Typography>
        </Alert>

        <Paper
          variant="outlined"
          sx={{
            padding: 2,
            backgroundColor: '#f9f9f9',
            marginBottom: 2,
            wordBreak: 'break-all',
          }}
        >
          <Typography
            variant="h6"
            fontFamily="monospace"
            color="primary"
            sx={{ userSelect: 'all' }}
          >
            {token}
          </Typography>
        </Paper>

        <Button
          variant="contained"
          startIcon={<ContentCopyIcon />}
          onClick={handleCopyToken}
          fullWidth
          size="large"
          color={copied ? 'success' : 'primary'}
        >
          {copied ? '¡Token Copiado!' : 'Copiar Token'}
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ marginTop: 2, display: 'block' }}>
          Contacta a tu administrador del sistema para habilitar esta terminal
        </Typography>
      </Paper>
    </Box>
  );
};

export default TerminalNotEnabled;

import { Box, Paper, Chip } from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import StoreIcon from '@mui/icons-material/Store';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { useTerminal } from '../hooks/useTerminal';

/**
 * Componente de ejemplo que muestra cómo usar el hook useTerminal
 * para acceder a la información de la terminal desde cualquier componente.
 */
const TerminalInfo = () => {
  const { idTerminalWeb, nombreSucursal, nombreDeposito, isValidated } = useTerminal();

  if (!isValidated) {
    return null;
  }

  return (
    <Paper
      elevation={1}
      sx={{
        padding: 2,
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <ComputerIcon color="primary" />
      
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip
          icon={<ComputerIcon />}
          label={`Terminal: ${idTerminalWeb}`}
          color="primary"
          size="small"
        />
        
        {nombreSucursal && (
          <Chip
            icon={<StoreIcon />}
            label={`Sucursal: ${nombreSucursal}`}
            color="secondary"
            size="small"
          />
        )}
        
        {nombreDeposito && (
          <Chip
            icon={<WarehouseIcon />}
            label={`Depósito: ${nombreDeposito}`}
            color="info"
            size="small"
          />
        )}
      </Box>
    </Paper>
  );
};

export default TerminalInfo;

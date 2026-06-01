import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Alert,
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';

interface DetArqueoTransferenciasProps {
    disabled?: boolean;
}

const DetArqueoTransferencias: React.FC<DetArqueoTransferenciasProps> = ({ disabled = false }) => {
    return (
        <Box sx={{
            position: 'relative',
            ...(disabled && {
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(180, 180, 180, 0.4)',
                    borderRadius: 1,
                    zIndex: 1,
                    pointerEvents: 'none',
                }
            })
        }}>
            <Paper
                sx={{
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: '#f5f5f5',
                    border: '2px dashed #bdbdbd',
                    borderRadius: 2,
                }}
            >
                <SyncIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    🔄 Transferencias
                </Typography>
                <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        Esta sección estará disponible próximamente.
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Aquí podrás registrar transferencias bancarias y movimientos entre cuentas.
                    </Typography>
                </Alert>
            </Paper>
        </Box>
    );
};

export default DetArqueoTransferencias;

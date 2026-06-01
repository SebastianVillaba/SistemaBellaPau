import React from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { usePermission } from '../hooks/usePermission';
import { useNavigate } from 'react-router-dom';

interface RequirePermissionProps {
    permission: string;
    children: React.ReactNode;
}

const RequirePermission: React.FC<RequirePermissionProps> = ({ permission, children }) => {
    const { hasPermission, loading } = usePermission(permission);
    const navigate = useNavigate();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!hasPermission) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" color="error" gutterBottom>
                    Acceso Denegado
                </Typography>
                <Typography variant="body1" paragraph>
                    No tienes permiso para acceder a esta sección.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Volver al Inicio
                </Button>
            </Box>
        );
    }

    return <>{children}</>;
};

export default RequirePermission;

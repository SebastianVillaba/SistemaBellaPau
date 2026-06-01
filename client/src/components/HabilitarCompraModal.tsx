import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Box,
    Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface HabilitarCompraModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (habilitar: boolean) => void;
}

const HabilitarCompraModal: React.FC<HabilitarCompraModalProps> = ({
    open,
    onClose,
    onConfirm,
}) => {
    const handleSi = () => {
        // Si el usuario dice "Si", habilitarCompra debe ser 0 (false) según requerimiento
        onConfirm(false);
    };

    const handleNo = () => {
        // Si el usuario dice "No", habilitarCompra debe ser 1 (true) según requerimiento
        onConfirm(true);
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
                    boxShadow: 3,
                    border: '2px solid black' // Adding border to match the sketch roughly
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 4 }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                    Desea habilitar la compra?
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', gap: 10, py: 4, justifyContent: 'center' }}>
                    {/* Botón Si */}
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleSi}
                        sx={{
                            width: 120,
                            height: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                                backgroundColor: '#b2e7c8ff',
                            }
                        }}
                    >
                        Si
                        <CheckIcon sx={{ fontSize: 40 }} />
                    </Button>

                    {/* Botón No */}
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleNo}
                        sx={{
                            width: 120,
                            height: 100,
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                                backgroundColor: '#f3bfbfff',
                            }
                        }}
                    >
                        No
                        <CloseIcon sx={{ fontSize: 40 }} />
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default HabilitarCompraModal;

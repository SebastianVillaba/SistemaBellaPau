import {
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Typography,
    Box,
    Stack,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import TextField from '../UppercaseTextField';
import { useState, useEffect } from 'react';
import type { TerminalWeb } from '../../types/terminalWeb.types';
import { pedidoInternoService } from '../../services/pedidoInterno.service';
import { remisionService } from '../../services/remision.service';
// import { ventaService } from '../../services/venta.service';

interface TerminalWebFormProps {
    formData: TerminalWeb;
    setFormData: React.Dispatch<React.SetStateAction<TerminalWeb>>;
    isNewMode: boolean;
}

export default function TerminalWebForm({ formData, setFormData, isNewMode }: TerminalWebFormProps): JSX.Element {
    const [sucursales, setSucursales] = useState<any[]>([]);
    const [depositos, setDepositos] = useState<any[]>([]);
    const [puntosExpedicion, setPuntosExpedicion] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [sucursalesData, depositosData] = await Promise.all([
                    pedidoInternoService.consultaSucursales(),
                    remisionService.consultaDeposito(),
                    // ventaService.obtenerPuntosExpedicion() // TODO: Clarify with user
                ]);
                setSucursales(sucursalesData);
                setDepositos(depositosData);
                // setPuntosExpedicion(puntosData);
            } catch (error) {
                console.error('Error al cargar datos auxiliares:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (field: keyof TerminalWeb) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
    ) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Box>
            <Typography variant="caption" color="error" sx={{ my: 2, display: 'block' }}>
                * Datos Obligatorios
            </Typography>
            <Stack spacing={2.5}>

                {/* Nombre Terminal */}
                <TextField
                    fullWidth
                    label="Nombre Terminal"
                    value={formData.nombreTerminal}
                    onChange={handleChange('nombreTerminal')}
                    required
                    size="small"
                    error={!formData.nombreTerminal}
                    helperText={!formData.nombreTerminal ? 'Campo obligatorio' : ''}
                />

                {/* Token */}
                <TextField
                    fullWidth
                    label="Token Terminal"
                    value={formData.terminalToken}
                    onChange={handleChange('terminalToken')}
                    required
                    size="small"
                    error={!formData.terminalToken}
                    helperText={!formData.terminalToken ? 'Campo obligatorio' : ''}
                />

                {/* Sucursal */}
                <FormControl fullWidth size="small" error={!formData.idSucursal}>
                    <InputLabel>Sucursal</InputLabel>
                    <Select
                        value={formData.idSucursal || ''}
                        onChange={handleChange('idSucursal')}
                        label="Sucursal"
                        disabled={loading}
                    >
                        {sucursales.map((sucursal) => (
                            <MenuItem key={sucursal.idSucursal} value={sucursal.idSucursal}>
                                {sucursal.nombreSucursal}
                            </MenuItem>
                        ))}
                    </Select>
                    {!formData.idSucursal && <Typography variant="caption" color="error" sx={{ ml: 2 }}>Campo obligatorio</Typography>}
                </FormControl>

                {/* Punto de Expedición (Factura) */}
                <FormControl fullWidth size="small" error={!formData.idFactura}>
                    <InputLabel>Punto de Expedición</InputLabel>
                    <Select
                        value={formData.idFactura || ''}
                        onChange={handleChange('idFactura')}
                        label="Punto de Expedición"
                        disabled={loading}
                    >
                        {puntosExpedicion.map((punto) => (
                            <MenuItem key={punto.idFactura} value={punto.idFactura}>
                                {punto.timbrado} - {punto.puntoExpedicion}
                            </MenuItem>
                        ))}
                    </Select>
                    {!formData.idFactura && <Typography variant="caption" color="error" sx={{ ml: 2 }}>Campo obligatorio</Typography>}
                </FormControl>

                {/* Deposito Venta */}
                <FormControl fullWidth size="small" error={!formData.idDepositoVenta}>
                    <InputLabel>Depósito Venta</InputLabel>
                    <Select
                        value={formData.idDepositoVenta || ''}
                        onChange={handleChange('idDepositoVenta')}
                        label="Depósito Venta"
                        disabled={loading}
                    >
                        {depositos.map((deposito) => (
                            <MenuItem key={deposito.idDeposito} value={deposito.idDeposito}>
                                {deposito.nombreDeposito}
                            </MenuItem>
                        ))}
                    </Select>
                    {!formData.idDepositoVenta && <Typography variant="caption" color="error" sx={{ ml: 2 }}>Campo obligatorio</Typography>}
                </FormControl>

                {/* Deposito Compra */}
                <FormControl fullWidth size="small" error={!formData.idDepositoCompra}>
                    <InputLabel>Depósito Compra</InputLabel>
                    <Select
                        value={formData.idDepositoCompra || ''}
                        onChange={handleChange('idDepositoCompra')}
                        label="Depósito Compra"
                        disabled={loading}
                    >
                        {depositos.map((deposito) => (
                            <MenuItem key={deposito.idDeposito} value={deposito.idDeposito}>
                                {deposito.nombreDeposito}
                            </MenuItem>
                        ))}
                    </Select>
                    {!formData.idDepositoCompra && <Typography variant="caption" color="error" sx={{ ml: 2 }}>Campo obligatorio</Typography>}
                </FormControl>

                {/* Deposito Remisión */}
                <FormControl fullWidth size="small" error={!formData.idDepositoRemision}>
                    <InputLabel>Depósito Remisión</InputLabel>
                    <Select
                        value={formData.idDepositoRemision || ''}
                        onChange={handleChange('idDepositoRemision')}
                        label="Depósito Remisión"
                        disabled={loading}
                    >
                        {depositos.map((deposito) => (
                            <MenuItem key={deposito.idDeposito} value={deposito.idDeposito}>
                                {deposito.nombreDeposito}
                            </MenuItem>
                        ))}
                    </Select>
                    {!formData.idDepositoRemision && <Typography variant="caption" color="error" sx={{ ml: 2 }}>Campo obligatorio</Typography>}
                </FormControl>

                {/* Activo (Only if editing) */}
                {!isNewMode && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.activo === true || formData.activo === undefined}
                                onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                                name="activo"
                            />
                        }
                        label="Activo"
                    />
                )}
            </Stack>
        </Box>
    );
}

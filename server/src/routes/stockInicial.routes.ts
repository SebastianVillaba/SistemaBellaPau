import { Router } from 'express';
import {
    agregarDetalle,
    eliminarDetalle,
    consultarDetalle,
    guardarStockInicial
} from '../controllers/stockInicial.controller';

const router = Router();

// Rutas para detalle temporal
router.post('/detalle', agregarDetalle);
router.delete('/detalle/:idTerminalWeb/:idDetStockInicialTmp', eliminarDetalle);
router.get('/detalle/:idTerminalWeb', consultarDetalle);

// Ruta para confirmar y guardar
router.post('/guardar', guardarStockInicial);

export default router;

import { Router } from 'express';
import {
    agregarDetPedidoInternoTmp,
    eliminarDetPedidoInternoTmp,
    guardarPedidoInterno,
    consultaPedidosInternosRecibidos,
    consultaDetPedidoInternoTmp,
    consultaDetPedidoInternoEntrante,
    consultaSucursales
} from '../controllers/pedidoInterno.controller';

const router = Router();

router.post('/detalle', agregarDetPedidoInternoTmp);
router.delete('/detalle', eliminarDetPedidoInternoTmp);
router.post('/', guardarPedidoInterno);
router.get('/detalle', consultaDetPedidoInternoTmp);
router.get('/recibidos', consultaPedidosInternosRecibidos);
router.get('/recibidos/detalle', consultaDetPedidoInternoEntrante);
router.get('/sucursales', consultaSucursales);

export default router;

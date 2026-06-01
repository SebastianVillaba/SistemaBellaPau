import { Router } from 'express';
import {
    consultarStock,
    agregarDetalleRemision,
    guardarRemision,
    recibirRemision,
    consultaDepositos,
    consultaDetalleRemisionTmp,
    eliminarDetRemisionTmp,
    consultaRemisionesEntrantes,
    consultaDetRemisionEntrante,
    importarPedidoInterno
} from '../controllers/remision.controller';

const router = Router();

router.get('/stock', consultarStock);
router.post('/detalle', agregarDetalleRemision);
router.post('/', guardarRemision);
router.post('/recibir', recibirRemision);
router.post('/importar-pedido', importarPedidoInterno);
router.get('/depositos', consultaDepositos);
router.get('/detalle', consultaDetalleRemisionTmp);
router.delete('/detalle', eliminarDetRemisionTmp);
router.get('/remisionesEntrantes', consultaRemisionesEntrantes);
router.get('/detalleRemisionEntrante', consultaDetRemisionEntrante);

export default router;

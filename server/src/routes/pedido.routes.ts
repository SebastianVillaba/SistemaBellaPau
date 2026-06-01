import { Router } from 'express';
import {
    agregarDetPedidoTmp, guardarPedidoFinal, consultaPedidosDia, consultarDetallePedido,
    consultaTipoCobro, eliminarDetallePedido, obtenerDatosPedido,
    facturarPedidosPendientesCliente, pedidoClienteFacturacion, pedidosClienteMasivoAFacturacion,
    agregarDetPedidoFacturacionTmp, eliminarDetPedidoFacturacionTmp,
    consultaPedidoFecha, consultaPedidoFiltro,
    limpiarDetPedidoTmp, anularPedido
} from '../controllers/pedido.controller';
//import { authMiddleware } from '../Middlewares/auth.middleware';

const router = Router();

router.post('/detalle', agregarDetPedidoTmp);
router.get('/detalle', consultarDetallePedido);
router.delete('/detalle', eliminarDetallePedido);
router.post('/', guardarPedidoFinal);
router.get('/dia', consultaPedidosDia);
router.get('/tipoCobro', consultaTipoCobro);
router.delete('/detalleTmp', limpiarDetPedidoTmp);

// Facturación de pedidos
router.post('/facturacion/cliente-pendientes', facturarPedidosPendientesCliente);
router.post('/facturacion/pedido', pedidoClienteFacturacion);
router.post('/facturacion/masivo', pedidosClienteMasivoAFacturacion);
router.post('/facturacion/tmp', agregarDetPedidoFacturacionTmp);
router.delete('/facturacion/tmp', eliminarDetPedidoFacturacionTmp);

// Búsqueda/filtrado de pedidos
router.get('/buscar/fecha', consultaPedidoFecha);
router.get('/buscar/filtro', consultaPedidoFiltro);

router.get('/:idPedido', obtenerDatosPedido);
router.put('/anular/:idPedido', anularPedido);

export default router;


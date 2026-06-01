import express from 'express';
import { reporteFacturaVenta, reporteTicketVenta, reporteTicketPedidoDia, reporteCierreCaja, reporteTicketRemision, reportePedidoDelivery, reporteVentaProductoDia } from '../controllers/reporte.controller';

const router = express.Router();

// Ruta para obtener el reporte de una factura
router.get('/factura', reporteFacturaVenta);

// Ruta para obtener el reporte de un ticket
router.get('/ticket', reporteTicketVenta);
router.get('/ticket-pedido', reporteTicketPedidoDia);
router.get('/cierre-caja', reporteCierreCaja);
router.get('/ticket-remision', reporteTicketRemision);

// Ruta para el reporte de pedido por delivery
router.get('/pedido-delivery', reportePedidoDelivery);

// Ruta para el reporte de venta de productos por día
router.get('/venta-producto-dia', reporteVentaProductoDia);

export default router;

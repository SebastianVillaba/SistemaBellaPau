import { Router } from 'express';
import {
  consultaVentaNroFactura,
  consultaVentaFecha,
  consultaInformacionVenta
} from '../controllers/consultaVenta.controller';

const router = Router();

// Consulta ventas por número de factura (sucursal-caja-factura)
// GET /api/consulta-venta/nro-factura?dsuc=1&dcaja=1&dfactu=1
router.get('/nro-factura', consultaVentaNroFactura);

// Consulta ventas por rango de fechas
// GET /api/consulta-venta/fecha?desde=2026-01-01&hasta=2026-03-16&imp=1
router.get('/fecha', consultaVentaFecha);

// Consulta información detallada de una venta (cabecera + detalle)
// GET /api/consulta-venta/informacion?idVenta=1
router.get('/informacion', consultaInformacionVenta);

export default router;

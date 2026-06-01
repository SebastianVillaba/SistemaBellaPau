import { Router } from 'express';
import { agregarDetalleVenta, consultarDetalleVenta, eliminarDetalleVenta, guardarVenta, consultaFacturaCorrelativa } from '../controllers/venta.controller';
// import { verifyToken } from '../Middlewares/auth.middleware'; // Deshabilitado temporalmente

const router = Router();

// Ruta para agregar un item al detalle de venta temporal
// TODO: Agregar autenticación cuando el sistema de login esté implementado
router.post('/detalletmp', agregarDetalleVenta);

// Ruta para consultar los items del detalle de venta temporal
// TODO: Agregar autenticación cuando el sistema de login esté implementado
router.get('/detalletmp', consultarDetalleVenta);

// Ruta para eliminar un item del detalle de venta temporal
// TODO: Agregar autenticación cuando el sistema de login esté implementado
router.delete('/detalletmp', eliminarDetalleVenta);

// Ruta para guardar/finalizar una venta
// TODO: Agregar autenticación cuando el sistema de login esté implementado
router.post('/guardar', guardarVenta);

// Ruta para consultar la factura actual
// TODO: Agregar autenticación cuando el sistema de login esté implementado
// Ruta para consultar la factura actual
// TODO: Agregar autenticación cuando el sistema de login esté implementado
router.get('/facturaActual', consultaFacturaCorrelativa);


export default router;

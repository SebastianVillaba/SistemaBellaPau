import { Router } from 'express';
import {
    agregarDetalleCompra,
    consultarDetalleTemporal,
    eliminarItemTemporal,
    limpiarTemporal,
    guardarCompra,
    buscarProducto,
    buscarProveedor
} from '../controllers/compras.controller';

const router = Router();

// Búsqueda de productos
router.get('/productos', buscarProducto);

// Rutas para manejo de detalle temporal
router.post('/detalle/tmp', agregarDetalleCompra);
router.get('/detalle/tmp', consultarDetalleTemporal);
router.delete('/detalle/tmp', eliminarItemTemporal); // Eliminar un item específico
router.delete('/detalle/tmp/all', limpiarTemporal);  // Limpiar todo el temporal

// Ruta para guardar la compra final
router.post('/', guardarCompra);

router.get('/proveedor', buscarProveedor);

export default router;

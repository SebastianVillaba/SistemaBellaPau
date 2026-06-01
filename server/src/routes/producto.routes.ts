import express from 'express';
import { insertarProducto, buscarProductos, obtenerInfoProducto, obtenerTiposProducto, consultarPrecioProducto, modificarProducto } from '../controllers/producto.controller';

const router = express.Router();

router.post('/', insertarProducto);
router.put('/', modificarProducto);
router.get('/consulta', buscarProductos);
router.get('/info', obtenerInfoProducto);
router.get('/tipoProducto', obtenerTiposProducto);
router.get('/precio', consultarPrecioProducto);

export default router;
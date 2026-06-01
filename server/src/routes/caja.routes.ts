import { Router } from 'express';
import { 
  consultarCajas, 
  abrirCaja, 
  cerrarCaja, 
  agregarGastoCaja,
  agregarArqueoCajaTmp,
  listarArqueoCajaTmp,
  eliminarArqueoCajaTmp,
  eliminarGastoCajaTmp,
  listarGastoCajaTmp
} from '../controllers/caja.controller';

const router = Router();

// Ruta para consultar las cajas disponibles
router.get('/consultar', consultarCajas);

// Ruta para abrir una caja
router.post('/abrir', abrirCaja);

// Ruta para cerrar una caja
router.post('/cerrar', cerrarCaja);

// Ruta para agregar un gasto a la caja
router.post('/gasto', agregarGastoCaja);

// Ruta para listar los gastos de la caja
router.get('/gasto', listarGastoCajaTmp);

// Ruta para agregar los detalles al arqueo de caja
router.post('/agregarArqueoCajaTmp', agregarArqueoCajaTmp);

// Ruta para listar los detalles del arqueo de la caja
router.get('/listarArqueoCajaTmp', listarArqueoCajaTmp);

// Ruta para eliminar un arqueo de caja
router.delete('/eliminarArqueoCajaTmp', eliminarArqueoCajaTmp);

// Ruta para eliminar un gasto de caja
router.delete('/eliminarGastoCajaTmp', eliminarGastoCajaTmp);

export default router;

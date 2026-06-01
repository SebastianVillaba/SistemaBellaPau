import { Router } from 'express';
import { verificarPermisoAnular, anularFacturacion } from '../controllers/anulacion.controller';

const router = Router();

// Verifica si un usuario tiene permiso para anular según el tipo
// GET /api/anulacion/permiso?idUsuario=1&tipo=FACTU
router.get('/permiso', verificarPermisoAnular);

// Anula una facturación (venta)
// POST /api/anulacion/facturacion
router.post('/facturacion', anularFacturacion);

export default router;

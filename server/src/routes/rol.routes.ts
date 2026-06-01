import { Router } from 'express';
import { obtenerConfiguracionRol, guardarConfiguracionRol, validarPermiso, obtenerRoles } from '../controllers/rol.controller';

const router = Router();

router.get('/configuracion/:idRol', obtenerConfiguracionRol);
router.post('/configuracion', guardarConfiguracionRol);
router.post('/validar', validarPermiso);
router.get('/roles', obtenerRoles);

export default router;

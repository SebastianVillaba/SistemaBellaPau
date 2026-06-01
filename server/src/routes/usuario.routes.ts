import { Router } from 'express';
import { crearUsuario, modificarUsuario, buscarUsuario, obtenerUsuario, buscarPersonaParaUsuario } from '../controllers/usuario.controller';

const router = Router();

router.post('/', crearUsuario);
router.put('/', modificarUsuario);
router.get('/buscar', buscarUsuario);
router.get('/buscar-persona', buscarPersonaParaUsuario);
router.get('/:idUsuario', obtenerUsuario);

export default router;

import { Router } from 'express';
import { crearUsuario, modificarUsuario, buscarUsuario, obtenerUsuario, buscarPersonaParaUsuario, validarVendedor } from '../controllers/usuario.controller';

const router = Router();

router.post('/', crearUsuario);
router.put('/', modificarUsuario);
router.get('/buscar', buscarUsuario);
router.get('/buscar-persona', buscarPersonaParaUsuario);
router.post('/validar-vendedor', validarVendedor);
router.get('/:idUsuario', obtenerUsuario);

export default router;

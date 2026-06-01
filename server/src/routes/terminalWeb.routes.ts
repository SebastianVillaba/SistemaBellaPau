import { Router } from 'express';
import { crearTerminalWeb, modificarTerminalWeb, buscarTerminalWeb, obtenerTerminalWeb } from '../controllers/terminalWeb.controller';

const router = Router();

router.post('/', crearTerminalWeb);
router.put('/', modificarTerminalWeb);
router.get('/buscar', buscarTerminalWeb);
router.get('/:idTerminalWeb', obtenerTerminalWeb);

export default router;

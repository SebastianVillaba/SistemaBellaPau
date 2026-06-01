import { Router } from 'express';
import { validarTerminal, obtenerTerminalInfo } from '../controllers/terminal.controller';

const router = Router();

router.post('/validar', validarTerminal);
router.get('/info', obtenerTerminalInfo);

export default router;

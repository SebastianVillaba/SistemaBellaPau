import { Router } from 'express';
import { consultarAuditoria } from '../controllers/auditoria.controller';

const router = Router();

router.get('/', consultarAuditoria);

export default router;

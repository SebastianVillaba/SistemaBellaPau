import { Router } from 'express';
import { getDenominacionActivo } from '../controllers/denominacion.controller';

const router = Router();

router.get('/', getDenominacionActivo);

export default router;

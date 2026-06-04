import { Router } from 'express';
import { getCotizaciones } from '../controllers/cotizacion.controller';

const router = Router();

router.get('/', getCotizaciones);

export default router;

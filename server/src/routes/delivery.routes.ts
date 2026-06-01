import { Router } from 'express';
import { getDeliveryActivo } from '../controllers/delivery.controller';

const router = Router();

router.get('/activo', getDeliveryActivo);

export default router;

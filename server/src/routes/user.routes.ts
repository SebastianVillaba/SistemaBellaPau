import { Router } from 'express';
import { verifyToken } from '../Middlewares/auth.middleware';

const router = Router();

router.get('/', verifyToken);

export default router;

import express from 'express';
import { consultaSectoresActivos } from '../controllers/sector.controller';

const router = express.Router();

router.get('/', consultaSectoresActivos);

export default router;
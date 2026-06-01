import { Router } from "express";
import { consultaImpuesto } from "../controllers/impuesto.controller";

const router = Router();

router.get('/', consultaImpuesto);

export default router;
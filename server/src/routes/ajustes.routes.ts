import { Router } from "express";
import { agregarDetAjusteStockTmp, eliminarDetAjusteStockTmp, guardarAjusteStock, consultaDetAjusteStockTmp, consultaTipoAjuste } from "../controllers/ajustes.controller";

const router = Router();

router.post('/agregarDetAjusteStockTmp', agregarDetAjusteStockTmp);
router.post('/eliminarDetAjusteStockTmp', eliminarDetAjusteStockTmp);
router.post('/guardarAjusteStock', guardarAjusteStock);
router.get('/consultaDetAjusteStockTmp', consultaDetAjusteStockTmp);
router.get('/consultaTipoAjuste', consultaTipoAjuste);

export default router;
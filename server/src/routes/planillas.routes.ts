import express from 'express';
import { 
    agregarDetPlanillaPacienteTmp,
    consultaDetPlanillaPacienteTmp,
    eliminarDetPlanillaPacienteTmp, 
    guardarPlanillaPaciente,
    obtenerTipoPlanillaPac,
    agregarDetPlanillaFunTmp,
    consultaDetPlanillaFunTmp,
    eliminarDetPlanillaFunTmp,
    guardarPlanillaFuncionario,
    obtenerTipoPlanillaFun,
    consultaFuncionariosActivos 
} from '../controllers/planillas.controller';

const router = express.Router();

// ESTAS SON LAS RUTAS DE LAS PLANILLAS PARA PACIENTES
router.post('/agregarDetPlanillaPacienteTmp', agregarDetPlanillaPacienteTmp);
router.get('/consultaDetPlanillaPacienteTmp/:idTerminalWeb', consultaDetPlanillaPacienteTmp);
router.delete('/eliminarDetPlanillaPacienteTmp', eliminarDetPlanillaPacienteTmp);
router.post('/guardarPlanillaPaciente', guardarPlanillaPaciente);
router.get('/obtenerTipoPlanillaPac', obtenerTipoPlanillaPac);

// ESTAS SON LAS RUTAS DE LAS PLANILLAS PARA FUNCIONARIOS
router.post('/agregarDetPlanillaFunTmp', agregarDetPlanillaFunTmp);
router.get('/consultaDetPlanillaFunTmp/:idTerminalWeb', consultaDetPlanillaFunTmp);
router.delete('/eliminarDetPlanillaFunTmp', eliminarDetPlanillaFunTmp);
router.post('/guardarPlanillaFuncionario', guardarPlanillaFuncionario);
router.get('/obtenerTipoPlanillaFun', obtenerTipoPlanillaFun);
router.get('/consultaFuncionariosActivos', consultaFuncionariosActivos);

export default router;
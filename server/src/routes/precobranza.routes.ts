import { Router } from 'express';
import {
    getCobranzasPendientes,
    agregarDetPrecobranzaTmp,
    consultarDetPrecobranzaTmp,
    eliminarDetPrecobranzaTmp,
    guardarPrecobranza
} from '../controllers/precobranza.controller';

const router = Router();

router.get('/pendientes', getCobranzasPendientes);
router.post('/detalle/tmp', agregarDetPrecobranzaTmp);
router.get('/detalle/tmp', consultarDetPrecobranzaTmp);
router.delete('/detalle/tmp', eliminarDetPrecobranzaTmp);
router.post('/', guardarPrecobranza);

export default router;

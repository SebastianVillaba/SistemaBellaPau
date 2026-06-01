import { Router } from 'express';
import {
  obtenerDepartamentos,
  obtenerDistritosPorDepartamento,
  obtenerCiudadesPorDistrito,
  obtenerPaises,
  obtenerGruposCliente,
} from '../controllers/ubicacion.controller';

const router = Router();

/**
 * @route   GET /api/ubicaciones/departamentos
 * @desc    Obtiene todos los departamentos
 * @access  Public
 */
router.get('/departamentos', obtenerDepartamentos);

/**
 * @route   GET /api/ubicaciones/distritos?idDepartamento=1
 * @desc    Obtiene los distritos de un departamento específico
 * @access  Public
 */
router.get('/distritos', obtenerDistritosPorDepartamento);

/**
 * @route   GET /api/ubicaciones/ciudades?idDistrito=1
 * @desc    Obtiene las ciudades de un distrito específico
 * @access  Public
 */
router.get('/ciudades', obtenerCiudadesPorDistrito);

/**
 * @route   GET /api/ubicaciones/paises
 * @desc    Obtiene todos los países activos
 * @access  Public
 */
router.get('/paises', obtenerPaises);

/**
 * @route   GET /api/ubicaciones/gruposCliente
 * @desc    Obtiene todos los grupos de clientes activos
 * @access  Public
 */
router.get('/gruposCliente', obtenerGruposCliente);

export default router;

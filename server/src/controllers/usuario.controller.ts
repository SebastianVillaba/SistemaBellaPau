import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';
import { logger } from '../utils/logger';
import { CrearUsuarioRequest, ModificarUsuarioRequest } from '../types/usuario.type';
import bcrypt from 'bcryptjs';

export const crearUsuario = async (req: Request, res: Response) => {
    const { 
        idPersonal,
        username,
        password,
        idRol,
        idUsuarioAlta,
        anularCompra,
        anularVenta,
        anularRemision,
        anularRecepcion,
        anularGasto,
        anularAjuste
    } = req.body as CrearUsuarioRequest;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await executeRequest({
            isStoredProcedure: true,
            query: 'sp_crearUsuario',
            inputs: [
                { name: 'idPersonal', type: sql.Int, value: idPersonal },
                { name: 'username', type: sql.VarChar(50), value: username },
                { name: 'password', type: sql.VarChar(255), value: hashedPassword },
                { name: 'idRol', type: sql.Int, value: idRol },
                { name: 'idUsuarioAlta', type: sql.Int, value: idUsuarioAlta },
                { name: 'anularCompra', type: sql.Bit, value: anularCompra },
                { name: 'anularVenta', type: sql.Bit, value: anularVenta },
                { name: 'anularRemision', type: sql.Bit, value: anularRemision },
                { name: 'anularRecepcion', type: sql.Bit, value: anularRecepcion },
                { name: 'anularGasto', type: sql.Bit, value: anularGasto },
                { name: 'anularAjuste', type: sql.Bit, value: anularAjuste }
            ]
        });

        res.json({ success: true, message: 'Usuario creado exitosamente' });
    } catch (error: any) {
        logger.error('Error al crear usuario:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const modificarUsuario = async (req: Request, res: Response) => {
    const { idUsuario, username, password, idRol, activo } = req.body as ModificarUsuarioRequest;

    try {
        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        await executeRequest({
            isStoredProcedure: true,
            query: 'sp_modificarUsuario',
            inputs: [
                { name: 'idUsuario', type: sql.Int, value: idUsuario },
                { name: 'username', type: sql.VarChar(50), value: username },
                { name: 'password', type: sql.VarChar(255), value: hashedPassword },
                { name: 'idRol', type: sql.Int, value: idRol },
                { name: 'activo', type: sql.TinyInt, value: activo }
            ]
        });

        res.json({ success: true, message: 'Usuario modificado exitosamente' });
    } catch (error: any) {
        logger.error('Error al modificar usuario:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const buscarUsuario = async (req: Request, res: Response) => {
    const { busqueda } = req.query;

    try {
        const result = await executeRequest({
            isStoredProcedure: true,
            query: 'sp_buscarUsuario',
            inputs: [
                { name: 'busqueda', type: sql.VarChar(50), value: busqueda || '' }
            ]
        });

        res.json(result.recordset);
    } catch (error: any) {
        logger.error('Error al buscar usuarios:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const obtenerUsuario = async (req: Request, res: Response) => {
    const { idUsuario } = req.params;

    try {
        const result = await executeRequest({
            isStoredProcedure: true,
            query: 'sp_consultaInformacionUsuario',
            inputs: [
                { name: 'idUsuario', type: sql.Int, value: idUsuario }
            ]
        });

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error: any) {
        logger.error('Error al obtener usuario:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const buscarPersonaParaUsuario = async (req: Request, res: Response) => {
    const { busqueda } = req.query;

    try {
        const result = await executeRequest({
            isStoredProcedure: true,
            query: 'sp_buscarPersonaParaUsuario',
            inputs: [
                { name: 'busqueda', type: sql.VarChar(50), value: busqueda || '' }
            ]
        });

        res.json(result.recordset);
    } catch (error: any) {
        logger.error('Error al buscar persona para usuario:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const validarVendedor = async (req: Request, res: Response): Promise<void> => {
    const { password } = req.body;

    if (!password) {
        res.status(400).json({ success: false, message: 'La contraseña es obligatoria' });
        return;
    }

    try {
        // Query active users to verify password in-memory (bcrypt compare)
        const result = await executeRequest({
            query: 'SELECT idUsuario, username, password FROM usuario WHERE activo = 1',
            isStoredProcedure: false
        });

        let matchedUser = null;
        for (const user of result.recordset) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                matchedUser = user;
                break;
            }
        }

        if (!matchedUser) {
            res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
            return;
        }

        // Execute stored procedure to verify if they are a valid seller
        const spResult = await executeRequest({
            isStoredProcedure: true,
            query: 'sp_vendedorUsuario',
            inputs: [
                { name: 'idUsuario', type: sql.Int, value: matchedUser.idUsuario }
            ]
        });

        if (spResult.recordset && spResult.recordset.length > 0) {
            res.status(200).json({
                success: true,
                result: {
                    idVendedor: spResult.recordset[0].idVendedor,
                    nombre: spResult.recordset[0].vendedor
                }
            });
        } else {
            res.status(403).json({
                success: false,
                message: 'Usted no está habilitado/a como Vendedor/a en el Sistema..'
            });
        }

    } catch (error: any) {
        logger.error('Error al validar vendedor:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


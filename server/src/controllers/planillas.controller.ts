import { Request, Response } from 'express';
import { executeRequest, sql } from '../utils/dbHandler';


/**
 * * * * * * * * * * * * * * * * * * * * 
 *  ESTA ES LA ZONA DE PLANILLAS DE    *
 *              PACIENTES              *   
 * * * * * * * * * * * * * * * * * * * *
 */
export const agregarDetPlanillaPacienteTmp = async (req: Request, res: Response) => {
    const { idTerminalWeb, nombreApellido, ci, sala, desayuno, almuerzo, merienda, cena } = req.body;
    try {
        const result = await executeRequest({
            query: 'sp_agregarDetPlanillaPacTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'nombreApellido', type: sql.VarChar(100), value: nombreApellido },
                { name: 'ci', type: sql.VarChar(12), value: ci },
                { name: 'sala', type: sql.Int, value: sala },
                { name: 'desayuno', type: sql.Bit, value: desayuno },
                { name: 'almuerzo', type: sql.Bit, value: almuerzo },
                { name: 'merienda', type: sql.Bit, value: merienda },
                { name: 'cena', type: sql.Bit, value: cena }
            ]
        });
        res.status(200).json({ message: 'Detalle de planilla paciente tmp agregado exitosamente', result });
    } catch (error: any) {
        console.error('Error al agregar detalle de planilla paciente tmp', error);
        res.status(500).json({ error: 'Error al agregar detalle de planilla paciente tmp' });
    }
}

export const consultaDetPlanillaPacienteTmp = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'sp_consultaDetPlanillaPacTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: req.params.idTerminalWeb }
            ]
        });
        res.status(200).json({ message: 'Detalle de planilla paciente tmp consultado exitosamente', result });
    } catch (error: any) {
        console.error('Error al consultar detalle de planilla paciente tmp', error);
        res.status(500).json({ error: 'Error al consultar detalle de planilla paciente tmp' });
    }
}

export const eliminarDetPlanillaPacienteTmp = async (req: Request, res: Response) => {
    const { idTerminalWeb, idDetPlanillaPacTmp } = req.body;
    try {
        const result = await executeRequest({
            query: 'sp_eliminarDetPlanillaPacTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idDetPlanillaPacTmp', type: sql.Int, value: idDetPlanillaPacTmp }
            ]
        });
        res.status(200).json({ message: 'Detalle de planilla paciente tmp eliminado exitosamente', result });
    } catch (error: any) {
    }
}

export const obtenerTipoPlanillaPac = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'select * from tipoPlanillaPac',
            isStoredProcedure: false
        });
        res.status(200).json({ message: 'Tipo de planilla paciente consultado exitosamente', result });
    } catch (error: any) {
        console.error('Error al consultar tipo de planilla paciente', error);
        res.status(500).json({ error: 'Error al consultar tipo de planilla paciente' });
    }
}

export const guardarPlanillaPaciente = async (req: Request, res: Response) => {
    const { idTerminalWeb, idUsuarioAlta, fechaPlanilla, idTipoPlanillaPac } = req.body;
    try {
        const result = await executeRequest({
            query: 'sp_guardarPlanillaPaciente',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idUsuarioAlta', type: sql.Int, value: idUsuarioAlta },
                { name: 'fechaPlanilla', type: sql.Date, value: fechaPlanilla },
                { name: 'idTipoPlanillaPac', type: sql.Int, value: idTipoPlanillaPac }
            ]
        });
        res.status(200).json({ message: 'Planilla paciente guardada exitosamente', result });
    } catch (error: any) {
        console.error('Error al guardar planilla paciente', error);
        res.status(500).json({ error: 'Error al guardar planilla paciente' });
    }
}

/**
 * * * * * * * * * * * * * * * * * * * * 
 *  ESTA ES LA ZONA DE PLANILLAS DE    *
 *           FUNCIONARIOS              *   
 * * * * * * * * * * * * * * * * * * * *
 */

export const guardarPlanillaFuncionario = async (req: Request, res: Response) => {
    const { idUsuario, idTerminalWeb, fechaPlanilla, idTipoPlanilla } = req.body;
    console.log(idUsuario, idTerminalWeb, fechaPlanilla, idTipoPlanilla);

    try {
        const result = await executeRequest({
            query: 'sp_guardarPlanillaFuncionario',
            isStoredProcedure: true,
            inputs: [
                { name: 'idUsuarioAlta', type: sql.Int, value: idUsuario },
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'fechaPlanilla', type: sql.Date, value: fechaPlanilla },
                { name: 'idTipoPlanillaFun', type: sql.Int, value: idTipoPlanilla }
            ]
        });
        res.status(200).json({ message: 'Planilla funcionario guardada exitosamente', result });
    } catch (error: any) {
        console.error('Error al guardar planilla funcionario', error);
        res.status(500).json({ error: 'Error al guardar planilla funcionario' });
    }
}

export const agregarDetPlanillaFunTmp = async (req: Request, res: Response) => {
    const { idTerminalWeb, idFuncionario } = req.body;
    try {
        const result = await executeRequest({
            query: 'sp_agregarDetPlanillaFunTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idFuncionario', type: sql.Int, value: idFuncionario }
            ]
        });
        res.status(200).json({ message: 'Detalle de planilla funcionario tmp agregado exitosamente', result });
    } catch (error: any) {
        console.error('Error al agregar detalle de planilla funcionario tmp', error);
        res.status(500).json({ error: 'Error al agregar detalle de planilla funcionario tmp' });
    }
}

export const obtenerTipoPlanillaFun = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'select * from tipoPlanillaFun', // ESTO DESPUES DE ENTREGAR MI PROYECTO VOY A CONVERTIR EN UNA FUCNION
            isStoredProcedure: false
        });
        res.status(200).json({ message: 'Tipo de planilla funcionario consultado exitosamente', result });
    } catch (error: any) {
        console.error('Error al consultar tipo de planilla funcionario', error);
        res.status(500).json({ error: 'Error al consultar tipo de planilla funcionario' });
    }
}

export const consultaDetPlanillaFunTmp = async (req: Request, res: Response) => {
    const { idTerminalWeb } = req.params;
    try {
        const result = await executeRequest({
            query: 'sp_consultaDetPlanillaFunTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb }
            ]
        });
        res.status(200).json({ message: 'Funcionarios activos consultados exitosamente', result });
    } catch (error: any) {
        console.error('Error al consultar funcionarios activos', error);
        res.status(500).json({ error: 'Error al consultar funcionarios activos' });
    }
}

export const consultaFuncionariosActivos = async (req: Request, res: Response) => {
    try {
        const result = await executeRequest({
            query: 'select idFuncionario, nombreFuncionario, idSector from v_funcionario',
            isStoredProcedure: false
        })
        res.status(200).json({ message: 'Funcionarios activos consultados exitosamente', result });
    } catch (error: any) {
        console.error('Error al consultar funcionarios activos', error);
        res.status(500).json({ error: 'Error al consultar funcionarios activos' });
    }
}

export const eliminarDetPlanillaFunTmp = async (req: Request, res: Response) => {
    const { idTerminalWeb, idDetPlanillaFunTmp } = req.body;
    try {
        const result = await executeRequest({
            query: 'sp_eliminarDetPlanillaFunTmp',
            isStoredProcedure: true,
            inputs: [
                { name: 'idTerminalWeb', type: sql.Int, value: idTerminalWeb },
                { name: 'idDetPlanillaFunTmp', type: sql.Int, value: idDetPlanillaFunTmp }
            ]
        })
        res.status(200).json({ message: 'Detalle de planilla funcionario tmp eliminado exitosamente', result });
    } catch (error: any) {
        console.error('Error al eliminar detalle de planilla funcionario tmp', error);
        res.status(500).json({ error: 'Error al eliminar detalle de planilla funcionario tmp' });
    }
}
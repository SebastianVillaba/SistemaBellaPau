import { Request, Response } from "express";
import { executeRequest, sql } from "../utils/dbHandler";

export const consultaImpuesto = async (req: Request, res: Response): Promise<void> => {
    try {

        const result = await executeRequest({
            query: 'select idImpuesto,nombreImpuesto from impuesto',
            isStoredProcedure: false
        });

        res.status(200).json({
            success: true,
            result: result.recordset
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error al obtener información del impuesto",
            error: error.message
        });
    }
};
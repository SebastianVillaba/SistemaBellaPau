import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Auditoria {
    idAuditoria: number;
    fechaAuditoria: string;
    nombreTabla: string;
    TipoOperacion: string;
    UsuarioResponsable: string;
    Computadora: string;
    ResumenCambio: string;
    valorAnterior: string;
    valorNuevo: string;
}

export interface ConsultarAuditoriaRequest {
    nombreTabla?: string;
    fechaDesde?: Date | null;
    fechaHasta?: Date | null;
}

interface AuditoriaResponse {
    success: boolean;
    result: Auditoria[];
}

export const auditoriaService = {
    consultarAuditoria: async (params: ConsultarAuditoriaRequest): Promise<Auditoria[]> => {
        try {
            const response = await axios.get<AuditoriaResponse>(`${API_BASE_URL}/auditoria`, {
                params
            });
            return response.data.result;
        } catch (error: any) {
            console.error('Error al consultar auditoría:', error);
            throw new Error('Error al consultar auditoría');
        }
    }
};

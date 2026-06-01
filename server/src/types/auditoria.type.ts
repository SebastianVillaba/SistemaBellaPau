export interface Auditoria {
    idAuditoria: number;
    fechaAuditoria: Date;
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
    fechaDesde?: Date;
    fechaHasta?: Date;
}

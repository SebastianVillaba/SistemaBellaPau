export interface Usuario {
    idUsuario?: number;
    username: string;
    password?: string;
    idRol: number;
    nombreRol?: string;
    activo?: boolean;
    idPersona: number;
    nombrePersona?: string;
    ruc?: string;
    idUsuarioAlta?: number;
}

export interface UsuarioSearchResult {
    idUsuario: number;
    username: string;
    nombreCompleto: string;
    nombreRol: string;
    estado: string;
}

export interface CrearUsuarioRequest {
    idPersonal: number;
    username: string;
    password: string;
    idRol: number;
    idUsuarioAlta: number;
    anularCompra: boolean;
    anularVenta: boolean;
    anularRemision: boolean;
    anularRecepcion: boolean;
    anularGasto: boolean;
    anularAjuste: boolean;
}

export interface ModificarUsuarioRequest {
    idUsuario: number;
    username: string;
    password?: string;
    idRol: number;
    activo: number;
}

export interface Usuario {
    idUsuario: number;
    username: string;
    nombreCompleto: string;
    nombreRol: string;
    estado: string;
}

export interface UsuarioDetalle {
    idUsuario: number;
    username: string;
    idRol: number;
    nombreRol: string;
    activo: boolean;
    idPersona: number;
    nombrePersona: string;
    ruc: string;
}

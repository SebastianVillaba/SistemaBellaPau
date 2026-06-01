export interface PermisoConfiguracion {
    idPermiso: number;
    modulo: string;
    descripcion: string;
    nombreSistema: string;
    tienePermiso: boolean;
}

export interface GuardarPermisosRequest {
    idRol: number;
    permisos: number[]; // Array of idPermiso
}

export interface ValidarPermisoRequest {
    idUsuario: number;
    nombreSistema: string;
}

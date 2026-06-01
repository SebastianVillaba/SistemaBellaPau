// Tipos para las entidades de ubicación

export interface Departamento {
  idDepartamento: number;
  nombre: string;
}

export interface Distrito {
  idDistrito: number;
  nombre: string;
  idDepartamento: number;
}

export interface Ciudad {
  idCiudad: number;
  nombreCiudad: string;
  idDistrito: number;
}

// Response types
export interface DepartamentosResponse {
  success: boolean;
  message: string;
  data: Departamento[];
}

export interface DistritosResponse {
  success: boolean;
  message: string;
  data: Distrito[];
}

export interface CiudadesResponse {
  success: boolean;
  message: string;
  data: Ciudad[];
}

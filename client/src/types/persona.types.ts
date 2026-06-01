export interface Persona {
  idPersona?: number;
  nombre: string;
  ruc?: string;
  dv?: string;
  direccion?: string;
  idDepartamento?: number;           // ID del departamento seleccionado
  idDistrito?: number;               // ID del distrito seleccionado
  idCiudad?: string;                 // varchar(30) según el SP
  idPais?: number;                     
  telefono?: string;
  celular?: string;
  email?: string;                    
  fechaNacimiento?: string;          
  idUsuarioAlta: number;             
  idTipoDocumento?: number;          
  nombreFantasia?: string;
  codigo?: number;
  idGrupoCliente?: number;           
  tipoPersonaJur: boolean;           
  tipoProveedor: boolean;            
  responsableProveedor?: string;    
  timbrado?: string;                 
  tipoPersonaFis: boolean;           
  tipoPersonaCli: boolean;
  tipoPersonaPersonal?: boolean;
  idPersonal?: number;
}

export interface PersonaFormData extends Persona {}

export interface PersonaSearchParams {
  searchTerm?: string;
  searchBy?: 'nombre' | 'codigo' | 'ruc';
}

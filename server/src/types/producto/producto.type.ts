export interface InsertarProductoRequest {
  nombre?: string;
  presentacion?: string;
  codigo?: number;
  codigoBarra?: string;
  precio?: number;
  origen?: boolean;
  idUsuarioAlta?: number;
  idTipoProducto?: number;
  gasto?: boolean;
  activo?: boolean;
  idImpuesto?: number;
}

export interface InsertarProductoResponse {
  success: boolean;                  // Indica si la operación fue exitosa
  message: string;                   // Mensaje descriptivo del resultado
  rowsAffected?: number;             // Número de filas afectadas (opcional)
}

export interface BuscarProductoRequest {
  tipoBusqueda: number;
  busqueda: string;
}

export interface ModificarProductoRequest {
  idProducto: number;
  nombre: string;
  presentacion?: string;
  codigo?: number;
  codigoBarra?: string;
  precio?: number;
  origen?: number;
  idUsuarioMod: number;
  idTipoProducto?: number;
  gasto?: boolean;
  activo?: boolean;
  idImpuesto?: number;
}
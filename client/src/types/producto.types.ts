export interface Producto {
  idProducto?: number;
  nombre: string;
  presentacion: string;
  codigo: string;
  codigoBarra: string;
  precio: number;
  costo: number;
  idTipoProducto: number;
  idUsuarioAlta?: number;
  idStock?: number;
  gasto?: boolean;
  origen?: boolean;
  activo?: boolean;
  idImpuesto?: number;
}

export interface TipoProducto {
  idTipoProducto: number;
  nombreTipo: string;
  activo: boolean;
  habilitarDecimal: boolean;
}

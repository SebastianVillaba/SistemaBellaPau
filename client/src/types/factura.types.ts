export interface Cliente {
  idCliente?: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  documento?: string;
  dv?: string;
}

export interface Conductor {
  idConductor?: number;
  nombre: string;
  documento?: string;
}

export interface ItemFactura {
  idDetVentaTmp?: number;
  idProducto?: number;
  nro?: number;
  nombreMercaderia?: string;
  descripcion?: string;
  origen: string;
  unidades: number;
  precioUnitario?: number;
  descuento: number;
  subtotal: number;
  gravada10: number;
  gravada5: number;
  exenta: number;
  iva10: number;
  iva5: number;
  ivaTotal: number;
}

export interface Factura {
  idFactura?: number;
  numero: string;
  fecha: string;
  cliente: Cliente;
  conductor?: Conductor;
  condicion: 'CONTADO' | 'CREDITO';
  tipo: 'Casa 1' | 'Casa 2';
  items: ItemFactura[];
  subtotal: number;
  descuentoTotal: number;
  total: number;
  observaciones?: string;
  estado?: 'PENDIENTE' | 'PAGADA' | 'ANULADA';
}

export interface BuscarFacturaParams {
  numero?: string;
  fecha?: string;
  cliente?: string;
}

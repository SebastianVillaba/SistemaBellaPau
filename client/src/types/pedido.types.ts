export interface Cliente {
  idCliente?: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  documento?: string;
  dv?: string;
}

export interface ItemPedido {
  idDetPedidoTmp?: number;
  idProducto?: number;
  nro?: number;
  nombreMercaderia?: string;
  descripcion?: string;
  unidades: number;
  precioUnitario?: number;
  descuento: number;
  subtotal: number;
}

export interface Pedido {
  idPedido?: number;
  nroPedido?: string;
  fecha: string;
  cliente: Cliente;
  items: ItemPedido[];
  subtotal: number;
  descuentoTotal: number;
  total: number;
  delivery?: string;
  tipoPago?: string;
  estadoCobranza?: 'PENDIENTE' | 'PAGADO' | 'PARCIAL';
  observaciones?: string;
}

export interface FiltroPedidos {
  fecha?: string;
  cliente?: string;
  tipoCobro?: string;
  estadoCobranza?: string;
}

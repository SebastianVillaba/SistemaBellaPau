export interface ItemFactura {
  cantidad: number;
  codigo: number;
  mercaderia: string;
  precio: number;
  subtotal: number;
  porcentajeImpuesto: number;
}

export interface ItemTicket {
  cantidad: number;
  codigo: number;
  mercaderia: string;
  precio: number;
  subtotal: number;
}

export interface ItemTicketPedido {
  cantidad: number;
  mercaderia: string;
  precio: number;
  subtotal: number;
  codigo?: string | number;
}

export interface DatosFactura {
  // Datos de la empresa
  nombreFantasia: string;
  empresaContable: string;
  rubro: string;
  ruc: string;
  direccion: string;
  telefono: string;

  // Datos de la venta
  fechaHora: Date;
  nroFactura: string;
  total: number;

  // Datos de control fiscal
  timbrado: string;
  fechaInicioVigencia: Date;
  fechaFinVigencia: Date;

  // Datos del cliente
  cliente: string;
  rucCliente: string;
  direccionCliente: string;
  telefonoCliente: string;

  // Información adicional
  vendedor: string;
  tipoFactura: string;
  formaVenta: string;

  // Liquidación IVA
  gravada10: number;
  gravada5: number;
  exenta: number;
  iva10: number;
  iva5: number;
  totalIva: number;

  // Items
  items: ItemFactura[];
}

export interface DatosTicket {
  // Datos de la empresa
  nombreFantasia: string;
  ruc: string;
  nombreSucursal: string;
  nombreTipoPago: string;

  // Datos de la venta
  fechaHora: Date;
  idVenta: number;
  total: number;

  // Datos del cliente
  cliente: string;
  rucCliente: string;

  // Información adicional
  vendedor: string;
  totalLetra: string;

  // Footer de la factura
  leyenda: string;

  // Items
  items: ItemTicket[];
}

export interface DatosTicketPedido {
  numeroPedido: number | string;
  cliente: string;
  direccion: string;
  celular: string;
  fechaHora: Date;
  delivery: string;
  items: ItemTicketPedido[];
  total: number;
}

export interface DatosCierreCaja {
  resumen: {
    nombreCaja: string;
    cajeroApertura: string;
    cajeroCierre: string;
    fechaApertura: string;
    fechaCierre: string;
    montoInicial: number;
    totalVentas: number;
    totalCobranza: number;
    totalGastos: number;
    saldoTeorico: number;
    saldoReal: number;
    diferencia: number;
    estadoCierre: string;
  };
  gastos: Array<{
    fechaGasto: string;
    concepto: string;
    montoGasto: number;
  }>;
}

export interface ItemTicketRemision {
  codigo: number | string;
  mercaderia: string;
  cantidadEnviada: number;
  controlFisico: string;
}

export interface DatosTicketRemision {
  // Identificador
  idRemision: number;
  nroDocumento: string;
  fechaEmision: Date;

  // Origen
  sucursalOrigen: string;
  depositoOrigen: string;

  // Destino
  sucursalDestino: string;
  depositoDestino: string;

  // Datos Logísticos
  emitidoPor: string;
  estadoActual: string;
  observacion: string;
  referenciaDocumento: string;

  // Items
  items: ItemTicketRemision[];
}

export interface ItemPedidoDia {
  codigo: number | string;
  nombre: string;
  cantidad: number;
}

export interface DatosTicketPedidosDia {
  fechaImpresion: Date;
  items: ItemPedidoDia[];
}

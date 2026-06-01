export interface Caja {
  idCaja: number;
  nombreCaja: string;
  activo: boolean;
  estadoCaja: boolean; // false = cerrada, true = abierta
}

export interface MovimientoCaja {
  idMovimientoCaja: number;
  fechaApertura: string;
  fechaCierre: string | null;
}

export interface ArqueoCajaTmpItem {
  idArqueoTmp: number;
  idDenominacion: number;
  nombreBillete: string;
  valor: number;
  cantidad: number;
  subtotal: number;
}

export interface GastoCajaTmpItem {
  idGastoCajaTmp: number;
  concepto: string;
  montoGasto: number;
  fechaRegistro?: string;
}

export interface EstadoCaja {
  estadoCaja: boolean;
  idMovimientoCaja?: number;
  nroCaja?: number;
}


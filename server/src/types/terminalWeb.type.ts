export interface CrearTerminalWebRequest {
    nombreTerminal: string;
    terminalToken: string;
    idSucursal: number;
    idFactura: number;
    idDepositoVenta: number;
    idDepositoCompra: number;
    idDepositoRemision: number;
    idUsuarioAlta: number;
}

export interface ModificarTerminalWebRequest {
    idTerminalWeb: number;
    nombreTerminal: string;
    terminalToken: string;
    idSucursal: number;
    idFactura: number;
    idDepositoVenta: number;
    idDepositoCompra: number;
    idDepositoRemision: number;
    activo: boolean;
    idUsuarioMod: number;
}

export interface TerminalWeb {
    idTerminalWeb: number;
    nombreTerminal: string;
    terminalToken: string;
    nombreSucursal: string;
    estado: string;
}

export interface TerminalWebDetalle {
    idTerminalWeb: number;
    nombreTerminal: string;
    terminalToken: string;
    activo: boolean;
    idSucursal: number;
    idFactura: number;
    idDepositoVenta: number;
    idDepositoCompra: number;
    idDepositoRemision: number;
    nombreSucursal: string;
    timbradoFactura: string;
    depVenta: string;
    depCompra: string;
    depRemision: string;
}

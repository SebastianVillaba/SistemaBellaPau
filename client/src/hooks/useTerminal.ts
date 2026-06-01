import { useAppSelector } from '../store/hooks';
import { selectTerminalInfo, selectIsTerminalValidated } from '../store/terminalSlice';

export const useTerminal = () => {
  const terminalInfo = useAppSelector(selectTerminalInfo);
  const isValidated = useAppSelector(selectIsTerminalValidated);

  return {
    isValidated,
    idTerminalWeb: terminalInfo.idTerminalWeb,
    token: terminalInfo.token,
    idSucursal: terminalInfo.idSucursal,
    idFactura: terminalInfo.idFactura,
    idDepositoVenta: terminalInfo.idDepositoVenta,
    idDepositoRemision: terminalInfo.idDepositoRemision,
    idDepositoCompra: terminalInfo.idDepositoCompra,
    nroCaja: terminalInfo.nroCaja,
    estadoCaja: terminalInfo.estadoCaja
  };
};

export default useTerminal;

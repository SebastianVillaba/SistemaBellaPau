import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

export interface TerminalState {
  isValidated: boolean;
  isLoading: boolean;
  error: string | null;
  terminal: {
    idTerminalWeb: number | null;
    token: string | null;
    idSucursal: number | null;
    idFactura: number | null;
    idDepositoVenta: number | null;
    idDepositoRemision: number | null;
    idDepositoCompra: number | null;
    nroCaja: number | null;
    estadoCaja: boolean;
  };
}

const initialState: TerminalState = {
  isValidated: false,
  isLoading: false,
  error: null,
  terminal: {
    idTerminalWeb: null,
    token: null,
    idSucursal: null,
    idFactura: null,
    idDepositoVenta: null,
    idDepositoRemision: null,
    idDepositoCompra: null,
    nroCaja: null,
    estadoCaja: false
  },
};

export const terminalSlice = createSlice({
  name: 'terminal',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTerminalValidated: (state, action: PayloadAction<{
      idTerminalWeb: number;
      token: string;
      idSucursal?: number;
      idFactura?: number;
      idDepositoVenta?: number;
      idDepositoRemision?: number;
      idDepositoCompra?: number;
      nroCaja?: number;
      estadoCaja?: boolean;
    }>) => {
      state.isValidated = true;
      state.isLoading = false;
      state.error = null;
      state.terminal = {
        ...state.terminal,
        ...action.payload
      };
    },
    setTerminalError: (state, action: PayloadAction<{ error: string; token: string }>) => {
      state.isValidated = false;
      state.isLoading = false;
      state.error = action.payload.error;
      state.terminal.token = action.payload.token;
    },
    clearTerminal: (state) => {
      state.isValidated = false;
      state.isLoading = false;
      state.error = null;
      state.terminal = {
        idTerminalWeb: null,
        token: null,
        idSucursal: null,
        idFactura: null,
        idDepositoVenta: null,
        idDepositoRemision: null,
        idDepositoCompra: null,
        nroCaja: null,
        estadoCaja: false
      };
    },
  },
});

export const { setLoading, setTerminalValidated, setTerminalError, clearTerminal } = terminalSlice.actions;

// Selectores
export const selectTerminal = (state: RootState) => state.terminal;
export const selectIsTerminalValidated = (state: RootState) => state.terminal.isValidated;
export const selectTerminalInfo = (state: RootState) => state.terminal.terminal;
export const selectTerminalLoading = (state: RootState) => state.terminal.isLoading;
export const selectTerminalError = (state: RootState) => state.terminal.error;

export default terminalSlice.reducer;

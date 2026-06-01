import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import ABM from './pages/ABM';
import Clientes from './pages/Clientes';
import Facturacion from './pages/Facturacion';
import SidebarLayout from './components/SideBar/SidebarLayout';
import { Container } from '@mui/material';
import AuthLayout from './Layout/AuthLayout';
import LoginPage from './pages/Login/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import PersonasABM from './pages/ABM/PersonasABM';
import ProductosABM from './pages/ABM/ProductosABM';
import Pedidos from './pages/Pedidos';
import Precobranza from './pages/Cobranzas/Precobranza';
import Cobranza from './pages/Cobranzas/Cobranza';
import Compras from './pages/Compras/Compras';
import Remisiones from './pages/Remisiones';
import RecepcionesPendientes from './pages/RecepcionesPendientes';
import GenerarPedidoInterno from './pages/PedidoInterno/GenerarPedidoInterno';
import ConsultaPedidoInterno from './pages/PedidoInterno/ConsultaPedidoInterno';
import PlanillaPacientes from './pages/Sanatorio/PlanillaPacientes';
import PlanillaFuncionarios from './pages/Sanatorio/PlanillaFuncionarios';
import Ajustes from './pages/Mercaderia/Ajustes';
import Auditoria from './pages/Auditoria/Auditoria';
import Roles from './pages/Administracion/Roles';
import UsuariosABM from './pages/Administracion/UsuariosABM';
import TerminalesABM from './pages/Administracion/TerminalesABM';
import StockInicial from './pages/Mercaderia/StockInicial';
import ArqueoCaja from './pages/Caja/ArqueoCaja';
import ConsultaVentas from './pages/Consultas/ConsultaVentas';
import Reportes from './pages/Reportes/Reportes';

// Placeholder components for sub-routes
const ClientesABM = () => <Container><h3>Submenú Clientes (ABM)</h3></Container>;
const FacturacionClientes = () => <Container><h3>Submenú Facturación (Clientes)</h3></Container>;

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Ruta de login */}
      <Route path="/login" element={<AuthLayout />}>
        <Route index element={<LoginPage />} />
      </Route>

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SidebarLayout>
              <Outlet />
            </SidebarLayout>
          </ProtectedRoute>
        }
      >
        <Route index element={<h2>Bienvenido al Sistema</h2>} />
        <Route path="abm" element={<ABM />}>
          <Route path="personas" element={<PersonasABM />} />
          <Route path="productos" element={<ProductosABM />} />
          <Route path="clientes" element={<ClientesABM />} />
        </Route>
        <Route path="clientes" element={<Clientes />}>
          <Route path="facturacion-clientes" element={<FacturacionClientes />} />
        </Route>
        <Route path="facturacion" element={<Facturacion />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="cobranzas">
          <Route path="precobranza" element={<Precobranza />} />
          <Route path="cobranza" element={<Cobranza />} />
        </Route>
        <Route path="caja">
          <Route path="arqueo" element={<ArqueoCaja />} />
        </Route>
        <Route path="compras" element={<Compras />} />
        <Route path="remisiones" element={<Remisiones />} />
        <Route path="recepciones-pendientes" element={<RecepcionesPendientes />} />
        <Route path="pedido-interno">
          <Route path="generar" element={<GenerarPedidoInterno />} />
          <Route path="consulta" element={<ConsultaPedidoInterno />} />
        </Route>
        <Route path="mercaderia">
          <Route path="ajustes" element={<Ajustes />} />
          <Route path="stock-inicial" element={<StockInicial />} />
        </Route>
        <Route path="sanatorio">
          <Route path="pacientes" element={<PlanillaPacientes />} />
          <Route path="funcionarios" element={<PlanillaFuncionarios />} />
        </Route>
        <Route path="auditoria" element={<Auditoria />} />
        <Route path="consultas">
          <Route path="ventas" element={<ConsultaVentas />} />
        </Route>
        <Route path="reportes" element={<Reportes />} />
        <Route path="administracion">
          <Route path="roles" element={<Roles />} />
          <Route path="usuarios" element={<UsuariosABM />} />
          <Route path="terminales" element={<TerminalesABM />} />
        </Route>
      </Route>

      {/* Redirección por defecto al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
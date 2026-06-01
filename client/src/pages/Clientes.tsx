import { Container } from '@mui/material';
import React from 'react';
import { Outlet } from 'react-router-dom';

const Clientes: React.FC = () => {
  return (
    <Container>
      <h2>Módulo Clientes</h2>
      <p>Este es el módulo de Clientes. Aquí irán las consultas de ventas y facturación.</p>
      <Outlet /> {/* Para renderizar los sub-rutas de Clientes */}
    </Container>
  );
};

export default Clientes;

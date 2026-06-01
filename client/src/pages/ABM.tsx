import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Container from '@mui/material/Container';

const ABM: React.FC = () => {
  const location = useLocation();
  const showSubMenu = location.pathname === '/abm';

  return (
    <Container>
      <h2>Módulo ABM</h2>
      <Outlet />
    </Container>
  );
};

export default ABM;


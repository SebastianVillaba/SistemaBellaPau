import React, { useState } from 'react';
import { Box, Button, Stack, Typography, Alert } from '@mui/material';
import TextField from '../../components/UppercaseTextField';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

// Interfaces para tipar la respuesta de la API
interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    idUsuario: number;
    usuario: string;
  };
}

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>('/api/auth/login', {
        username: usuario,
        password: password
      });

      console.log('Login response:', response.data);

      if (response.data.success == true) {
        // Guardar token si existe
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }

        // Guardar información del usuario
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        // Redirigir al home
        navigate('/');
      } else {
        setError(response.data.message || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error during login:', error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message || 'Error al iniciar sesión');
      } else {
        setError('Error inesperado al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
        Iniciar sesión
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          label="Usuario"
          type="text"
          value={usuario}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsuario(e.target.value)}
          autoComplete="username"
          required
          fullWidth
          inputProps={{ maxLength: 10 }}
          disabled={loading}
        />

        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          fullWidth
          inputProps={{ maxLength: 10 }}
          disabled={loading}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </Stack>
    </Box>
  );
}



import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    components: {
        MuiInputBase: {
            styleOverrides: {
                input: {
                    // Fallback visual para todos los inputs, excepto password que suele tener su propio masking
                    // Usamos el selector :not([type="password"]) para evitar problemas visuales en password si fuera necesario
                    '&:not([type="password"])': {
                        textTransform: 'uppercase',
                    },
                },
            },
        },
    },
});

export default theme;

import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import React from 'react';

const UppercaseTextField: React.FC<TextFieldProps> = (props) => {
    const { onChange, type, ...other } = props;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Si es password, no transformar
        if (type === 'password') {
            if (onChange) onChange(e);
            return;
        }

        // Transformar a mayúsculas
        const originalValue = e.target.value;
        const upperValue = originalValue.toUpperCase();

        // Solo si el valor cambió (para evitar loops o actualizaciones innecesarias)
        if (originalValue !== upperValue) {
            e.target.value = upperValue;
        }

        if (onChange) {
            onChange(e);
        }
    };

    // Determinar si debemos aplicar el estilo visual también
    const inputPropsStyle = type !== 'password' ? { textTransform: 'uppercase' } : undefined;

    return (
        <TextField
            {...other}
            type={type}
            onChange={handleChange}
            inputProps={{
                ...other.inputProps,
                style: {
                    ...other.inputProps?.style,
                    ...inputPropsStyle
                }
            }}
        />
    );
};

export default UppercaseTextField;

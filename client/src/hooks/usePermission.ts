import { useState, useEffect } from 'react';
import { rolService } from '../services/rol.service';

export const usePermission = (nombreSistema: string) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkPermission = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setHasPermission(false);
                setLoading(false);
                return;
            }

            try {
                const user = JSON.parse(userStr);
                const result = await rolService.validarPermiso(user.idUsuario, nombreSistema);
                console.log(user.idUsuario);
                console.log(nombreSistema);
                console.log(result);
                setHasPermission(result);
            } catch (error) {
                console.error('Error checking permission:', error);
                setHasPermission(false);
            } finally {
                setLoading(false);
            }
        };

        checkPermission();
    }, [nombreSistema]);

    return { hasPermission, loading };
};

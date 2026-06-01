import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/delivery'; // Adjust base URL as needed

export const deliveryService = {
    getDeliveryActivo: async () => {
        const response = await axios.get(`${API_URL}/delivery/activo`, );
        return response.data;
    },
};

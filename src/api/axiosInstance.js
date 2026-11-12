import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8085/api', // رابط الـ Backend الخاص بـ Spring Boot
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;

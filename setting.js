import axios from 'axios';

const devMode = process.env.NODE_ENV !== 'production';
const baseUrl = devMode ? "http://localhost:3000/api/" : "https://your-production-url.com/api/";

const apiService = axios.create({
    baseURL: baseUrl,
});

export const userRoutes = {
    login: 'user/login',
};

export default apiService;

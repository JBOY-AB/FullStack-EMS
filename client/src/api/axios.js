import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_BASE_URL?.trim();
const productionBaseUrl = "https://full-stack-ems-server-rose.vercel.app";
const baseUrl = import.meta.env.PROD
    ? productionBaseUrl
    : (configuredBaseUrl || "http://localhost:4000");

const api = axios.create({
    baseURL: `${baseUrl.replace(/\/$/, "")}/api`
})

// Attach Auth token to all network requests

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

export default api;

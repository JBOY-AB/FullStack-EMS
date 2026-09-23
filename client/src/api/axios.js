import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_BASE_URL?.trim();

const api = axios.create({
    // Vercel builds must provide the deployed server URL. Relative /api keeps
    // same-domain deployments working without sending production requests to localhost.
    baseURL: configuredBaseUrl ? `${configuredBaseUrl.replace(/\/$/, "")}/api` : "/api"
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

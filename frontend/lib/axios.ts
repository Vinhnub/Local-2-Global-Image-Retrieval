import axios from "axios";

const api = axios.create({
    baseURL: "http://26.138.141.88:5555",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
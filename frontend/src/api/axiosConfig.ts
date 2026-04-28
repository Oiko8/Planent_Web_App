import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Before every request, take the token from localStorage
// and attach to the Authorization header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "null" && token !== "undefined") {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

//User not logged in → no token in localStorage → header not added → backend returns 401 for protected routes
//User logged in → token found → header added automatically → backend accepts the request

export default api;
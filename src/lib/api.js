import axios from 'axios';

/**
 * Configured Axios instance.
 * - Base URL read from VITE_API_URL env variable.
 * - Request interceptor: attaches stored JWT to every request.
 * - Response interceptor: clears token and reloads on 401.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // NOTE: Do NOT set a global Content-Type here.
    // For JSON requests, Axios sets it automatically.
    // For FormData (file uploads), the browser must set it with the multipart boundary.
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // If the request body is FormData, delete any Content-Type so the browser
        // can set the correct multipart/form-data boundary automatically.
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        } else {
            // Ensure JSON content type for all other requests
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => Promise.reject(error),
);

let navigate = null;

/**
 * Configure the navigate function to be used outside of React components.
 */
export const setNavigate = (nav) => {
    navigate = nav;
};

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login');

        if (error.response?.status === 401 && !isLoginRequest) {
            // Clear stale token and redirect to login for protected routes
            localStorage.removeItem('token');
            if (navigate) {
                navigate('/login');
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    },
);

export default api;

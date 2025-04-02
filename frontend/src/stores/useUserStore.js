import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,
    
    signup: async ({ name, email, password, confirmPassword }) => {
        set({ loading: true });
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            set({ loading: false });
            return;
        }
        try {
            const res = await axios.post("/auth/signup", { name, email, password });
            // Store the token on signup
            localStorage.setItem("token", res.data.token);
            set({ user: res.data.user, loading: false });
            toast.success("Account created successfully");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },
    
    login: async (email, password) => {
        set({ loading: true });
        try {
            const res = await axios.post("/auth/login", { email, password });
            // Store the token on login
            localStorage.setItem("token", res.data.token);
            set({ user: res.data.user, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },
    
    logout: async () => {
        try {
            await axios.post("/auth/logout");
            // Remove token on logout
            localStorage.removeItem("token");
            set({ user: null });
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred during logout");
            // Still remove the token even if the logout request fails
            localStorage.removeItem("token");
            set({ user: null });
        }
    },
    
    checkAuth: async () => {
        set({ checkingAuth: true });
        try {
            const response = await axios.get("/auth/profile");
            set({ user: response.data, checkingAuth: false });
        } catch (error) {
            console.log(error.message);
            set({ checkingAuth: false, user: null });
        }
    },
    
    refreshToken: async () => { 
        // Prevent multiple simultaneous refresh attempts
        if (get().checkingAuth) return;
        
        set({ checkingAuth: true }); // Fixed typo from chekingAuth
        try {
            const response = await axios.post("/auth/refresh-token");
            // Store the new token
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }
            set({ checkingAuth: false });
            return response.data;
        } catch (error) {
            set({ user: null, checkingAuth: false });
            // Remove invalid token
            localStorage.removeItem("token");
            throw error;
        }
    }
}));

// Add request interceptor to include token in all requests
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Axios interceptor for token refresh
let refreshPromise = null;
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // If a refresh is already in progress, wait for it to complete
                if (refreshPromise) { // Fixed logic error
                    await refreshPromise;
                    return axios(originalRequest);
                }
                
                // Start a new refresh process
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;
                
                return axios(originalRequest);
            } catch (error) {
                // If refresh fails, logout and reject the promise
                useUserStore.getState().logout();
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);
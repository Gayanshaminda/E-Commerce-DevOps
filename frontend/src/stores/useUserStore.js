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

            const token = res.data.token;
            if (token) {
                localStorage.setItem("token", token);
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            }

            set({ user: res.data.user, loading: false });
            toast.success("Login successful");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    logout: async () => {
        try {
            await axios.post("/auth/logout");
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];
            set({ user: null });
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred during logout");
        }
    },

    checkAuth: async () => {
        set({ checkingAuth: true });

        const token = localStorage.getItem("token");
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        try {
            const response = await axios.get("/auth/profile");
            set({ user: response.data, checkingAuth: false });
        } catch (error) {
            console.log(error.message);
            set({ checkingAuth: false, user: null });
            localStorage.removeItem("token");
        }
    },

    refreshToken: async () => {
        if (get().checkingAuth) return;

        set({ checkingAuth: true });

        try {
            const response = await axios.post("/auth/refresh-token");
            const newToken = response.data.token;

            if (newToken) {
                localStorage.setItem("token", newToken);
                axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            }

            set({ checkingAuth: false });
            return response.data;
        } catch (error) {
            set({ user: null, checkingAuth: false });
            localStorage.removeItem("token");
            throw error;
        }
    }
}));

// Axios Interceptor for Token Refresh
let refreshPromise = null;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                if (!refreshPromise) {
                    refreshPromise = useUserStore.getState().refreshToken();
                    await refreshPromise;
                    refreshPromise = null;
                } else {
                    await refreshPromise;
                }

                return axios(originalRequest);
            } catch (error) {
                useUserStore.getState().logout();
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

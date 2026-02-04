import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import api from "./axios";

interface FailedRequest {
  resolve: (value?: unknown) => void;
  reject: (error: any) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Fonction pour déconnecter l'utilisateur proprement
const handleLogout = () => {
  console.warn("Session expirée ou invalide. Déconnexion...");
  // Nettoyer le stockage local si nécessaire (ex: localStorage.clear())
  if (typeof window !== "undefined") {
    // Rediriger vers la page de login (ajustez le chemin selon votre app)
    window.location.href = "/?message=session_expired";
  }
};

export const setupInterceptors = () => {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // 1. Gérer l'échec spécifique du refresh token (403 Forbidden)
      // Si la requête qui a échoué est elle-même le refresh-token
      if (
        originalRequest.url?.includes("/auth/refresh-token") &&
        error.response?.status === 403
      ) {
        isRefreshing = false;
        handleLogout();
        return Promise.reject(error);
      }

      // 2. Gérer l'expiration normale (401 Unauthorized)
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Si un refresh est déjà en cours, on met la requête en attente
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => api(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Tenter de rafraîchir le token
          await api.post("/auth/refresh-token");

          isRefreshing = false;
          processQueue(null); // Libérer les requêtes en attente

          return api(originalRequest); // Re-tenter la requête initiale
        } catch (err: any) {
          isRefreshing = false;
          processQueue(err, null);

          // Si le refresh échoue (403 ou autre), on déconnecte
          handleLogout();

          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    },
  );
};

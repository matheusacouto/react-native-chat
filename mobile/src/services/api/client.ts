import axios from "axios";

export const API = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}`,
});

let onSessionExpired: (() => Promise<void>) | null = null;
let isHandlingSessionExpired = false;

export function setSessionExpiredHandler(handler: () => Promise<void>) {
  onSessionExpired = handler;
}

export function clearSessionExpiredHandler() {
  onSessionExpired = null;
  isHandlingSessionExpired = false;
}

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (
      (status === 401 || status === 403) &&
      onSessionExpired &&
      !isHandlingSessionExpired
    ) {
      isHandlingSessionExpired = true;

      try {
        await onSessionExpired();
      } finally {
        isHandlingSessionExpired = false;
      }
    }

    return Promise.reject(error);
  },
);

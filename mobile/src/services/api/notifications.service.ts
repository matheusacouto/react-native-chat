import { API } from "./client";

export async function getNotifications(idToken: string) {
  const response = await API.get("/notifications", {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  return response.data;
}

export async function markNotificationAsRead(
  idToken: string,
  recipientId: number,
) {
  const response = await API.patch(
    `/notifications/read/${recipientId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    },
  );

  return response.data;
}

export async function sendGlobalNotification(
  idToken: string,
  data: {
    title: string;
    description: string;
    icon?: string | null;
    destinationRoute?: string | null;
    payload?: Record<string, any> | null;
  },
) {
  const response = await API.post("/notifications/global", data, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  return response.data;
}

export async function sendIndividualNotification(
  idToken: string,
  data: {
    title: string;
    description: string;
    recipientId: number;
    icon?: string | null;
    destinationRoute?: string | null;
    payload?: Record<string, any> | null;
  },
) {
  const response = await API.post("/notifications/individual", data, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  return response.data;
}

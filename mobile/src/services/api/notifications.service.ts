import { API } from "./client";

export async function getNotifications(idToken: string) {
  const response = await API.get("/notifications", {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  return response.data;
}

export async function markNotificationAsRead(recipientId: number, idToken) {
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

import { API } from "./client";
import { NotificationItem } from "@/src/models/notification";
import {
  PaginatedResponse,
  PaginationParams,
} from "@/src/models/paginated-response";

export async function getNotifications(
  idToken: string,
  pagination?: PaginationParams,
): Promise<PaginatedResponse<NotificationItem>> {
  const response = await API.get("/notifications", {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    params: pagination,
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

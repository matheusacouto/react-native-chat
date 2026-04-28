import { API } from "./client";
import { MessageModel } from "@/src/models/message";
import {
  PaginatedResponse,
  PaginationParams,
} from "@/src/models/paginated-response";

export async function startConversation(
  currentUserId: number,
  targetUserId: number,
) {
  const response = await API.post("/chat/conversation", {
    currentUserId,
    targetUserId,
  });

  return response.data;
}

export async function sendMessage(
  currentUserId: number,
  targetUserId: number,
  text: string,
) {
  const response = await API.post("/chat/message", {
    currentUserId,
    targetUserId,
    text,
  });

  return response.data;
}

export async function getConversationMessages(
  conversationId: number,
  pagination?: PaginationParams,
): Promise<PaginatedResponse<MessageModel>> {
  const response = await API.get(
    `/chat/conversation/${conversationId}/messages`,
    {
      params: pagination,
    },
  );

  return response.data;
}

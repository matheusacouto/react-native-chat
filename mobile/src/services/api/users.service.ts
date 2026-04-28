import { API } from "./client";
import { UserModel } from "@/src/models/user";
import {
  PaginatedResponse,
  PaginationParams,
} from "@/src/models/paginated-response";

export async function getUsers(
  idToken: string,
  pagination?: PaginationParams,
): Promise<PaginatedResponse<UserModel>> {
  const response = await API.get("/users", {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    params: pagination,
  });

  return response.data;
}

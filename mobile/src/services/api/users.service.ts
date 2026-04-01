import { API } from "./client";

export async function getUsers(idToken: string) {
  const response = await API.get("/users", {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  return response.data;
}

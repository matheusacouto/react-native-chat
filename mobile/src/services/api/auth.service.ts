import { API } from "./client";

export async function loginWithFirebase(idToken: string) {
  const response = await API.post("/auth/login/firebase", { idToken });

  return response.data;
}

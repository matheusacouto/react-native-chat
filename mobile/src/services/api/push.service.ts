import { API } from "./client";

export async function registerPushToken(
  idToken: string,
  token: string,
  platform: string,
) {
  const response = await API.post(
    "/push/register-token",
    {
      token,
      platform,
    },
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    },
  );

  return response.data;
}

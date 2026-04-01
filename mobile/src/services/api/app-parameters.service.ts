import { API } from "./client";
import { AppParameterModel } from "@/src/models/app-parameter";

export async function getActiveAppParameters(): Promise<AppParameterModel[]> {
  const response = await API.get("/app-parameters/active");

  return response.data;
}

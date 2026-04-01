import axios from "axios";

export const API = axios.create({
  baseURL: "http://10.3.152.11:3000",
});

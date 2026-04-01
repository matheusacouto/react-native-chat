import { UserModel } from "./user";

export type ConversationModel = {
  id: number;
  usuario_1: UserModel;
  usuario_2: UserModel;
  created_at: string;
  updated_at: string;
};

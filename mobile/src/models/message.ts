import { ConversationModel } from "./conversation";
import { UserModel } from "./user";

export type MessageModel = {
  id: number;
  conversa: ConversationModel;
  remetente: UserModel;
  destinatario: UserModel;
  mensagem: string;
  lida: boolean;
  lida_em: string | null;
  created_at: string;
  updated_at: string;
};

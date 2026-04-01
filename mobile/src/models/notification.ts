export type NotificationItem = {
  id: number;
  lida: boolean;
  lida_em: string | null;
  entregue_push: boolean;
  entregue_push_em: string | null;
  created_at: string;
  notificacao: {
    id: number;
    tipo: "global" | "individual";
    titulo: string;
    descricao: string;
    icone: string | null;
    rota_destino: string | null;
    payload: Record<string, any> | null;
    created_at: string;
  };
};

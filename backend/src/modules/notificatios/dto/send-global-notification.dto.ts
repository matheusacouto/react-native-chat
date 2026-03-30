export class SendGlobalNotificationDto {
  titulo: string;
  descricao: string;
  icone: string | null;
  rotaDestino: string | null;
  payload: Record<string, any> | null;
}

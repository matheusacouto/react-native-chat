export class SendIndividualNotificationDto {
  titulo: string;
  descricao: string;
  icone: string | null;
  rotaDestino: string | null;
  payload: Record<string, any> | null;
  destinatarioId: number;
}

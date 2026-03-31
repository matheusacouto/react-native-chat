export class SendIndividualNotificationDto {
  title: string;
  description: string;
  icon: string | null;
  destinationRoute: string | null;
  payload: Record<string, any> | null;
  recipientId: number;
}

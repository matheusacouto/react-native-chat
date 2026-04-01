export function buildNotificationPayload(payload: string) {
  const normalizedPayload = payload.trim();

  if (!normalizedPayload) {
    return null;
  }

  return { raw: normalizedPayload };
}

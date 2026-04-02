const FALLBACK_ERROR_MESSAGE =
  "Não foi possível concluir a ação. Tente novamente.";

const firebaseAuthErrorMessages: Record<string, string> = {
  "auth/account-exists-with-different-credential":
    "Esta conta já está vinculada a outro método de acesso.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/invalid-email": "Informe um e-mail válido.",
  "auth/network-request-failed":
    "Não foi possível conectar. Verifique sua internet e tente novamente.",
  "auth/popup-closed-by-user": "O login foi cancelado antes da conclusão.",
  "auth/too-many-requests":
    "Muitas tentativas seguidas. Aguarde um pouco e tente novamente.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/user-not-found": "Não encontramos uma conta com esse e-mail.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
};

const googleSignInErrorMessages: Record<string, string> = {
  IN_PROGRESS: "O login com Google já está em andamento.",
  PLAY_SERVICES_NOT_AVAILABLE:
    "Os serviços do Google não estão disponíveis neste dispositivo.",
  SIGN_IN_CANCELLED: "O login com Google foi cancelado.",
};

const httpStatusMessages: Record<number, string> = {
  400: "Os dados enviados são inválidos. Revise e tente novamente.",
  401: "Sua sessão não é mais válida. Entre novamente.",
  403: "Você não tem permissão para realizar essa ação.",
  404: "Não encontramos o recurso solicitado.",
  408: "A solicitação demorou demais. Tente novamente.",
  409: "Já existe um registro com esses dados.",
  422: "Alguns dados precisam ser corrigidos antes de continuar.",
  429: "Muitas tentativas seguidas. Aguarde um pouco e tente novamente.",
  500: "O servidor encontrou um problema. Tente novamente em instantes.",
  502: "O servidor está temporariamente indisponível. Tente novamente.",
  503: "O serviço está indisponível no momento. Tente novamente.",
  504: "O servidor demorou para responder. Tente novamente.",
};

function extractMessageFromResponseData(data: unknown) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data !== "object" || data === null) {
    return null;
  }

  const maybeMessage = Reflect.get(data, "message");

  if (typeof maybeMessage === "string" && maybeMessage.trim()) {
    return maybeMessage;
  }

  if (Array.isArray(maybeMessage)) {
    const firstMessage = maybeMessage.find(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );

    if (firstMessage) {
      return firstMessage;
    }
  }

  return null;
}

function isAxiosLikeError(
  error: unknown,
): error is {
  isAxiosError: boolean;
  response?: {
    status?: number;
    data?: unknown;
  };
  code?: string;
} {
  return (
    typeof error === "object" &&
    error !== null &&
    Reflect.get(error, "isAxiosError") === true
  );
}

export function getUserFriendlyErrorMessage(
  error: unknown,
  fallback = FALLBACK_ERROR_MESSAGE,
) {
  if (isAxiosLikeError(error)) {
    const responseMessage = extractMessageFromResponseData(error.response?.data);

    if (responseMessage) {
      return responseMessage;
    }

    const status = error.response?.status;

    if (status && httpStatusMessages[status]) {
      return httpStatusMessages[status];
    }

    if (error.code === "ECONNABORTED") {
      return "A solicitação demorou demais. Tente novamente.";
    }

    if (!error.response) {
      return "Não foi possível conectar ao servidor. Verifique sua internet.";
    }
  }

  if (typeof error === "object" && error !== null) {
    const code = Reflect.get(error, "code");

    if (typeof code === "string") {
      if (firebaseAuthErrorMessages[code]) {
        return firebaseAuthErrorMessages[code];
      }

      if (googleSignInErrorMessages[code]) {
        return googleSignInErrorMessages[code];
      }
    }

    const message = Reflect.get(error, "message");

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

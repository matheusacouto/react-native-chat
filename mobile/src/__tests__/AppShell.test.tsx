import { ReactNode } from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { AppShell } from "@/App";

const mockUseAuth = jest.fn();
const mockRouterPush = jest.fn();
const mockIsCurrentRoute = jest.fn();
const mockAddNotificationResponseListener = jest.fn();
const mockAddNotificationReceivedListener = jest.fn();

jest.mock("@/src/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("@/src/contexts/ConnectivityContext", () => ({
  ConnectivityProvider: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("@/src/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("@/src/navigation/AppNavigator", () => ({
  AppNavigator: () => null,
}));

jest.mock("@/src/navigation/router", () => ({
  isCurrentRoute: (...args: unknown[]) => mockIsCurrentRoute(...args),
  router: {
    push: (...args: unknown[]) => mockRouterPush(...args),
  },
}));

jest.mock("@/src/services/firebase/push", () => ({
  addNotificationReceivedListener: (...args: unknown[]) =>
    mockAddNotificationReceivedListener(...args),
  addNotificationResponseListener: (...args: unknown[]) =>
    mockAddNotificationResponseListener(...args),
}));

describe("AppShell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddNotificationReceivedListener.mockReturnValue({ remove: jest.fn() });
    mockAddNotificationResponseListener.mockReturnValue({ remove: jest.fn() });
    mockIsCurrentRoute.mockReturnValue(false);
  });

  it("waits for authentication before navigating from a push notification", async () => {
    let listener:
      | ((response: {
          notification: {
            request: {
              content: {
                data: {
                  rota_destino: string;
                };
              };
            };
          };
        }) => void)
      | undefined;

    mockAddNotificationResponseListener.mockImplementation((callback) => {
      listener = callback;
      return { remove: jest.fn() };
    });

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const view = render(<AppShell />);

    await act(async () => {
      listener?.({
        notification: {
          request: {
            content: {
              data: {
                rota_destino: "/notification",
              },
            },
          },
        },
      });
    });

    expect(mockRouterPush).not.toHaveBeenCalled();

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    view.rerender(<AppShell />);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/notification");
    });
  });

  it("shows a foreground notification when user is outside the destination route", async () => {
    let listener:
      | ((notification: {
          notification: {
            request: {
              content: {
                title: string;
                body: string;
                data: {
                  rota_destino: string;
                };
              };
            };
          };
        }) => void)
      | undefined;

    mockAddNotificationReceivedListener.mockImplementation((callback) => {
      listener = callback;
      return { remove: jest.fn() };
    });

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    const view = render(<AppShell />);

    await act(async () => {
      listener?.({
        notification: {
          request: {
            content: {
              title: "Nova mensagem",
              body: "Você recebeu uma mensagem.",
              data: {
                rota_destino: "/chat",
              },
            },
          },
        },
      });
    });

    expect(view.getByText("Nova mensagem")).toBeTruthy();
    expect(view.getByText("Você recebeu uma mensagem.")).toBeTruthy();

    fireEvent.press(view.getByText("Nova mensagem"));

    expect(mockRouterPush).toHaveBeenCalledWith("/chat");
  });

  it("does not show a foreground notification when user is already on the destination route", async () => {
    let listener:
      | ((notification: {
          notification: {
            request: {
              content: {
                title: string;
                body: string;
                data: {
                  rota_destino: string;
                };
              };
            };
          };
        }) => void)
      | undefined;

    mockIsCurrentRoute.mockReturnValue(true);
    mockAddNotificationReceivedListener.mockImplementation((callback) => {
      listener = callback;
      return { remove: jest.fn() };
    });

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    const view = render(<AppShell />);

    await act(async () => {
      listener?.({
        notification: {
          request: {
            content: {
              title: "Notificação da tela atual",
              body: "Esta não deve aparecer.",
              data: {
                rota_destino: "/notification",
              },
            },
          },
        },
      });
    });

    expect(view.queryByText("Notificação da tela atual")).toBeNull();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("does not show a foreground notification when user is signed out", async () => {
    let listener:
      | ((notification: {
          notification: {
            request: {
              content: {
                title: string;
                body: string;
                data: {
                  rota_destino: string;
                };
              };
            };
          };
        }) => void)
      | undefined;

    mockAddNotificationReceivedListener.mockImplementation((callback) => {
      listener = callback;
      return { remove: jest.fn() };
    });

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    const view = render(<AppShell />);

    await act(async () => {
      listener?.({
        notification: {
          request: {
            content: {
              title: "Notificação sem sessão",
              body: "Esta também não deve aparecer.",
              data: {
                rota_destino: "/chat",
              },
            },
          },
        },
      });
    });

    expect(view.queryByText("Notificação sem sessão")).toBeNull();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("ignores notification taps while user is signed out", async () => {
    let listener:
      | ((response: {
          notification: {
            request: {
              content: {
                data: {
                  rota_destino: string;
                };
              };
            };
          };
        }) => void)
      | undefined;

    mockAddNotificationResponseListener.mockImplementation((callback) => {
      listener = callback;
      return { remove: jest.fn() };
    });

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    const view = render(<AppShell />);

    await act(async () => {
      listener?.({
        notification: {
          request: {
            content: {
              data: {
                rota_destino: "/chat",
              },
            },
          },
        },
      });
    });

    expect(mockRouterPush).not.toHaveBeenCalled();

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    view.rerender(<AppShell />);

    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});

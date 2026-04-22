import { ReactNode } from "react";
import { act, render, waitFor } from "@testing-library/react-native";
import { AppShell } from "@/App";

const mockUseAuth = jest.fn();
const mockRouterPush = jest.fn();
const mockAddNotificationResponseListener = jest.fn();

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
  router: {
    push: (...args: unknown[]) => mockRouterPush(...args),
  },
}));

jest.mock("@/src/services/firebase/push", () => ({
  addNotificationResponseListener: (...args: unknown[]) =>
    mockAddNotificationResponseListener(...args),
}));

describe("AppShell", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});

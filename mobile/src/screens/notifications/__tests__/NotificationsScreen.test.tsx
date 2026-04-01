import { fireEvent, render, waitFor } from "@testing-library/react-native";
import NotificationsScreen from "@/src/screens/notifications/NotificationsScreen";

jest.mock("@/src/hooks/useRequireInternet", () => ({
  useRequireInternet: jest.fn(),
}));

jest.mock("@/src/services/firebase/auth", () => ({
  getIdToken: jest.fn(),
}));

jest.mock("@/src/services/api/notifications.service", () => ({
  getNotifications: jest.fn(),
  markNotificationAsRead: jest.fn(),
}));

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

const mockUseRequireInternet =
  require("@/src/hooks/useRequireInternet").useRequireInternet;
const mockGetIdToken = require("@/src/services/firebase/auth").getIdToken;
const mockGetNotifications =
  require("@/src/services/api/notifications.service").getNotifications;
const mockMarkNotificationAsRead =
  require("@/src/services/api/notifications.service").markNotificationAsRead;
const mockRouter = require("expo-router").router;

const notificationsFixture = [
  {
    id: 1,
    lida: false,
    notificacao: {
      titulo: "Nova mensagem",
      descricao: "Você recebeu uma mensagem",
      rota_destino: "/chat",
    },
  },
  {
    id: 2,
    lida: true,
    notificacao: {
      titulo: "Aviso",
      descricao: "Notificação já lida",
      rota_destino: "/notification",
    },
  },
];

describe("NotificationsScreen", () => {
  beforeEach(() => {
    mockUseRequireInternet.mockReturnValue(jest.fn(() => true));
    mockGetIdToken.mockResolvedValue("fake-token");
    mockGetNotifications.mockResolvedValue(notificationsFixture);
    mockMarkNotificationAsRead.mockImplementation(
      async (_idToken: string, recipientId: number) => ({
        ...notificationsFixture.find((item) => item.id === recipientId),
        id: recipientId,
        lida: true,
      }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("loads and renders notifications", async () => {
    const { getByText } = render(<NotificationsScreen />);

    await waitFor(() => {
      expect(getByText("Nova mensagem")).toBeTruthy();
      expect(getByText("Aviso")).toBeTruthy();
    });

    expect(mockGetNotifications).toHaveBeenCalledWith("fake-token");
  });

  it("marks unread notification as read and navigates", async () => {
    const { getByText } = render(<NotificationsScreen />);

    await waitFor(() => {
      expect(getByText("Nova mensagem")).toBeTruthy();
    });

    fireEvent.press(getByText("Nova mensagem"));

    await waitFor(() => {
      expect(mockMarkNotificationAsRead).toHaveBeenCalledWith("fake-token", 1);
      expect(mockRouter.push).toHaveBeenCalledWith("/chat");
    });
  });

  it("does not load notifications when internet is unavailable", async () => {
    const requireInternet = jest.fn(() => false);
    mockUseRequireInternet.mockReturnValue(requireInternet);

    render(<NotificationsScreen />);

    await waitFor(() => {
      expect(requireInternet).toHaveBeenCalledWith(
        "Conecte-se para carregar notificações.",
      );
    });

    expect(mockGetIdToken).not.toHaveBeenCalled();
    expect(mockGetNotifications).not.toHaveBeenCalled();
  });
});

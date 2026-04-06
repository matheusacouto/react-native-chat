import { fireEvent, render, waitFor } from "@testing-library/react-native";
import LoginScreen from "@/src/screens/auth/LoginScreen";

jest.mock("@/src/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/src/hooks/useRequireInternet", () => ({
  useRequireInternet: jest.fn(),
}));

jest.mock("@/src/navigation/router", () => ({
  Redirect: ({ href }: { href: string }) => `Redirect:${href}`,
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

const mockUseAuth = require("@/src/hooks/useAuth").useAuth;
const mockUseRequireInternet =
  require("@/src/hooks/useRequireInternet").useRequireInternet;
const mockRouter = require("@/src/navigation/router").router;

describe("LoginScreen", () => {
  beforeEach(() => {
    mockUseRequireInternet.mockReturnValue(jest.fn(() => true));
    mockUseAuth.mockReturnValue({
      signIn: jest.fn().mockResolvedValue(undefined),
      signInWithGoogle: jest.fn().mockResolvedValue(undefined),
      isLoading: false,
      isAuthenticated: false,
      authFeedback: null,
      clearAuthFeedback: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("calls signIn and redirects to home", async () => {
    const signIn = jest.fn().mockResolvedValue(undefined);
    const requireInternet = jest.fn(() => true);

    mockUseAuth.mockReturnValue({
      signIn,
      signInWithGoogle: jest.fn(),
      isLoading: false,
      isAuthenticated: false,
      authFeedback: null,
      clearAuthFeedback: jest.fn(),
    });
    mockUseRequireInternet.mockReturnValue(requireInternet);

    const { getByPlaceholderText, getAllByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("E-mail"), "teste@email.com");
    fireEvent.changeText(getByPlaceholderText("Senha"), "123456");
    fireEvent.press(getAllByText("Entrar")[1]);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("teste@email.com", "123456");
      expect(mockRouter.replace).toHaveBeenCalledWith("/home");
    });

    expect(requireInternet).toHaveBeenCalled();
  });

  it("does not continue when internet is unavailable", async () => {
    const signIn = jest.fn();
    const requireInternet = jest.fn(() => false);

    mockUseAuth.mockReturnValue({
      signIn,
      signInWithGoogle: jest.fn(),
      isLoading: false,
      isAuthenticated: false,
      authFeedback: null,
      clearAuthFeedback: jest.fn(),
    });
    mockUseRequireInternet.mockReturnValue(requireInternet);

    const { getAllByText } = render(<LoginScreen />);

    fireEvent.press(getAllByText("Entrar")[1]);

    await waitFor(() => {
      expect(requireInternet).toHaveBeenCalled();
    });

    expect(signIn).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("calls google sign-in and redirects to home", async () => {
    const signInWithGoogle = jest.fn().mockResolvedValue(undefined);

    mockUseAuth.mockReturnValue({
      signIn: jest.fn(),
      signInWithGoogle,
      isLoading: false,
      isAuthenticated: false,
      authFeedback: null,
      clearAuthFeedback: jest.fn(),
    });

    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText("Entrar com Google"));

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalledTimes(1);
      expect(mockRouter.replace).toHaveBeenCalledWith("/home");
    });
  });

  it("navigates to forgot password screen", () => {
    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText("Esqueci minha senha"));

    expect(mockRouter.push).toHaveBeenCalledWith("/forgot-password");
  });

  it("shows logout feedback when available", () => {
    mockUseAuth.mockReturnValue({
      signIn: jest.fn(),
      signInWithGoogle: jest.fn(),
      isLoading: false,
      isAuthenticated: false,
      authFeedback: {
        message: "Você saiu da sua conta com sucesso.",
        variant: "success",
      },
      clearAuthFeedback: jest.fn(),
    });

    const { getByText } = render(<LoginScreen />);

    expect(getByText("Você saiu da sua conta com sucesso.")).toBeTruthy();
  });
});

import { fireEvent, render } from "@testing-library/react-native";
import HomeScreen from "@/src/screens/home/HomeScreen";

jest.mock("@/src/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/src/hooks/useAppParameters", () => ({
  useAppParameters: jest.fn(),
}));

jest.mock("expo-router", () => ({
  Redirect: ({ href }: { href: string }) => `Redirect:${href}`,
  router: {
    push: jest.fn(),
  },
}));

const mockUseAuth = require("@/src/hooks/useAuth").useAuth;
const mockUseAppParameters =
  require("@/src/hooks/useAppParameters").useAppParameters;
const mockRouter = require("expo-router").router;

describe("HomeScreen", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        nome: "Usuário Teste",
        email: "usertest@teste.com",
        firebase_uid: "firebase-uid",
      },
      signOut: jest.fn(),
      isAuthenticated: true,
    });

    mockUseAppParameters.mockReturnValue({
      parameters: [],
      parameterMap: {},
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders fallback content when no app parameters are present", () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText("Home")).toBeTruthy();
    expect(getByText("Você entrou com sucesso no app.")).toBeTruthy();
    expect(getByText("Usuário Teste")).toBeTruthy();
  });

  it("renders parameterized content when app parameters exist", () => {
    mockUseAppParameters.mockReturnValue({
      parameters: [
        {
          id: 1,
          chave: "home_title",
          valor: "Central do Chat",
          descricao: null,
          tipo: "string",
          grupo: "home",
          ativo: true,
          created_at: "",
          updated_at: "",
        },
      ],
      parameterMap: {
        home_title: "Central do Chat",
        home_subtitle: "Subtítulo personalizado",
        home_notice: "Aviso vindo da API",
      },
      isLoading: false,
    });

    const { getAllByText, getByText } = render(<HomeScreen />);

    expect(getAllByText("Central do Chat")).toHaveLength(2);
    expect(getByText("Subtítulo personalizado")).toBeTruthy();
    expect(getByText("Aviso vindo da API")).toBeTruthy();
  });

  it("navigates to notifications when pressing the notifications button", () => {
    const { getByText } = render(<HomeScreen />);

    fireEvent.press(getByText("Notificações"));

    expect(mockRouter.push).toHaveBeenCalledWith("/notification");
  });

  it("calls signOut when pressing the exit button", () => {
    const signOut = jest.fn();

    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        nome: "Usuário Teste",
        email: "usertest@teste.com",
        firebase_uid: "firebase-uid",
      },
      signOut,
      isAuthenticated: true,
    });

    const { getByText } = render(<HomeScreen />);

    fireEvent.press(getByText("Sair"));

    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

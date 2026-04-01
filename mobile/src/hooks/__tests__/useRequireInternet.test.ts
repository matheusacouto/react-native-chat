import { Alert } from "react-native";
import { renderHook } from "@testing-library/react-native";
import { useRequireInternet } from "@/src/hooks/useRequireInternet";

jest.mock("@/src/contexts/ConnectivityContext", () => ({
  useConnectivity: jest.fn(),
}));

const mockUseConnectivity =
  require("@/src/contexts/ConnectivityContext").useConnectivity;

describe("useRequireInternet", () => {
  beforeEach(() => {
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns true when device is online", () => {
    mockUseConnectivity.mockReturnValue({ isOnline: true });

    const { result } = renderHook(() => useRequireInternet());

    expect(result.current()).toBe(true);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("shows alert and returns false when device is offline", () => {
    mockUseConnectivity.mockReturnValue({ isOnline: false });

    const { result } = renderHook(() => useRequireInternet());

    expect(result.current()).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      "Sem internet",
      "Conecte-se para continuar.",
    );
  });

  it("uses custom message when provided", () => {
    mockUseConnectivity.mockReturnValue({ isOnline: false });

    const { result } = renderHook(() =>
      useRequireInternet("Mensagem padrão"),
    );

    result.current("Mensagem customizada");

    expect(Alert.alert).toHaveBeenCalledWith(
      "Sem internet",
      "Mensagem customizada",
    );
  });
});

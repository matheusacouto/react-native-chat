import { renderHook, waitFor } from "@testing-library/react-native";
import { useAppParameters } from "@/src/hooks/useAppParameters";

jest.mock("@/src/services/api/app-parameters.service", () => ({
  getActiveAppParameters: jest.fn(),
}));

const mockGetActiveAppParameters =
  require("@/src/services/api/app-parameters.service").getActiveAppParameters;

describe("useAppParameters", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("loads parameters and builds the parameter map", async () => {
    mockGetActiveAppParameters.mockResolvedValue([
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
      {
        id: 2,
        chave: "home_notice",
        valor: "Aviso importante",
        descricao: null,
        tipo: "string",
        grupo: "home",
        ativo: true,
        created_at: "",
        updated_at: "",
      },
    ]);

    const { result } = renderHook(() => useAppParameters());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.parameters).toHaveLength(2);
    expect(result.current.parameterMap).toEqual({
      home_title: "Central do Chat",
      home_notice: "Aviso importante",
    });
  });

  it("returns empty state when service fails", async () => {
    mockGetActiveAppParameters.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useAppParameters());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.parameters).toEqual([]);
    expect(result.current.parameterMap).toEqual({});
  });
});

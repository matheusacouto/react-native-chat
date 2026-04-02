import { fireEvent, render } from "@testing-library/react-native";
import { NotificationFormFields } from "@/src/components/notifications/NotificationFormFields";

const mockUseAppParameters = jest.fn();

jest.mock("@/src/hooks/useAppParameters", () => ({
  useAppParameters: () => mockUseAppParameters(),
}));

describe("NotificationFormFields", () => {
  beforeEach(() => {
    mockUseAppParameters.mockReturnValue({
      parameterMap: {},
      parameters: [],
      isLoading: false,
    });
  });

  it("renders all expected fields", () => {
    const { getByPlaceholderText, getByText } = render(
      <NotificationFormFields
        title=""
        description=""
        destinationRoute=""
        icon=""
        onChangeTitle={jest.fn()}
        onChangeDescription={jest.fn()}
        onChangeDestinationRoute={jest.fn()}
        onChangeIcon={jest.fn()}
      />,
    );

    expect(getByPlaceholderText("Título")).toBeTruthy();
    expect(getByPlaceholderText("Descrição")).toBeTruthy();
    expect(getByText("Rota de destino")).toBeTruthy();
    expect(getByText("Nenhuma rota configurada")).toBeTruthy();
  });

  it("forwards input changes to handlers", () => {
    const onChangeTitle = jest.fn();
    const onChangeDescription = jest.fn();

    const { getByPlaceholderText } = render(
      <NotificationFormFields
        title=""
        description=""
        destinationRoute=""
        icon=""
        onChangeTitle={onChangeTitle}
        onChangeDescription={onChangeDescription}
        onChangeDestinationRoute={jest.fn()}
        onChangeIcon={jest.fn()}
      />,
    );

    fireEvent.changeText(getByPlaceholderText("Título"), "Aviso");
    fireEvent.changeText(getByPlaceholderText("Descrição"), "Descrição teste");

    expect(onChangeTitle).toHaveBeenCalledWith("Aviso");
    expect(onChangeDescription).toHaveBeenCalledWith("Descrição teste");
  });

  it("updates route and icon when a route is selected", () => {
    mockUseAppParameters.mockReturnValue({
      parameterMap: {
        notification_routes: JSON.stringify([
          { label: "Chat", value: "/chat", icon: "chat" },
        ]),
      },
      parameters: [],
      isLoading: false,
    });

    const onChangeDestinationRoute = jest.fn();
    const onChangeIcon = jest.fn();

    const { getByText } = render(
      <NotificationFormFields
        title=""
        description=""
        destinationRoute=""
        icon=""
        onChangeTitle={jest.fn()}
        onChangeDescription={jest.fn()}
        onChangeDestinationRoute={onChangeDestinationRoute}
        onChangeIcon={onChangeIcon}
      />,
    );

    fireEvent.press(getByText("Selecione uma rota"));
    fireEvent.press(getByText("Chat"));

    expect(onChangeDestinationRoute).toHaveBeenCalledWith("/chat");
    expect(onChangeIcon).toHaveBeenCalledWith("chat");
  });
});

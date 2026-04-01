import { fireEvent, render } from "@testing-library/react-native";
import { NotificationFormFields } from "@/src/components/notifications/NotificationFormFields";

describe("NotificationFormFields", () => {
  it("renders all expected inputs", () => {
    const { getByPlaceholderText } = render(
      <NotificationFormFields
        title=""
        description=""
        destinationRoute=""
        icon=""
        payload=""
        onChangeTitle={jest.fn()}
        onChangeDescription={jest.fn()}
        onChangeDestinationRoute={jest.fn()}
        onChangeIcon={jest.fn()}
        onChangePayload={jest.fn()}
      />,
    );

    expect(getByPlaceholderText("Título")).toBeTruthy();
    expect(getByPlaceholderText("Descrição")).toBeTruthy();
    expect(getByPlaceholderText("Rota de destino")).toBeTruthy();
    expect(getByPlaceholderText("Ícone (opcional)")).toBeTruthy();
    expect(getByPlaceholderText("Payload (opcional)")).toBeTruthy();
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
        payload=""
        onChangeTitle={onChangeTitle}
        onChangeDescription={onChangeDescription}
        onChangeDestinationRoute={jest.fn()}
        onChangeIcon={jest.fn()}
        onChangePayload={jest.fn()}
      />,
    );

    fireEvent.changeText(getByPlaceholderText("Título"), "Aviso");
    fireEvent.changeText(getByPlaceholderText("Descrição"), "Descrição teste");

    expect(onChangeTitle).toHaveBeenCalledWith("Aviso");
    expect(onChangeDescription).toHaveBeenCalledWith("Descrição teste");
  });
});

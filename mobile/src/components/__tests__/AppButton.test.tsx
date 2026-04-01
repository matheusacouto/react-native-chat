import { fireEvent, render } from "@testing-library/react-native";
import { AppButton } from "@/src/components/AppButton";

describe("AppButton", () => {
  it("renders the label", () => {
    const { getByText } = render(
      <AppButton title="Salvar" onPress={jest.fn()} />,
    );

    expect(getByText("Salvar")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <AppButton title="Salvar" onPress={onPress} />,
    );

    fireEvent.press(getByText("Salvar"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <AppButton title="Salvar" onPress={onPress} disabled />,
    );

    fireEvent.press(getByText("Salvar"));

    expect(onPress).not.toHaveBeenCalled();
  });
});

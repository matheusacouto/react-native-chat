import { fireEvent, render } from "@testing-library/react-native";
import { BackButton } from "@/src/components/BackButton";

describe("BackButton", () => {
  it("renders default label", () => {
    const { getByText } = render(<BackButton onPress={jest.fn()} />);

    expect(getByText("Voltar")).toBeTruthy();
  });

  it("renders custom label", () => {
    const { getByText } = render(
      <BackButton label="Retornar" onPress={jest.fn()} />,
    );

    expect(getByText("Retornar")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByText } = render(<BackButton onPress={onPress} />);

    fireEvent.press(getByText("Voltar"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

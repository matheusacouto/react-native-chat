import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

type BackButtonProps = {
  label?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function BackButton({
  label = "Voltar",
  onPress,
  style,
}: BackButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.button, style]}>
      <Text style={styles.arrow}>‹</Text>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  arrow: {
    color: "#1f6feb",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 20,
  },
  text: {
    color: "#102a43",
    fontSize: 14,
    fontWeight: "700",
  },
});

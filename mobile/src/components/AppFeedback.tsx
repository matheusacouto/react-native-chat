import { StyleSheet, Text, View } from "react-native";

type AppFeedbackVariant = "error" | "success" | "info";

type AppFeedbackProps = {
  message: string;
  variant?: AppFeedbackVariant;
};

export function AppFeedback({ message, variant = "error" }: AppFeedbackProps) {
  return (
    <View
      style={[
        styles.container,
        variant === "error" && styles.errorContainer,
        variant === "success" && styles.successContainer,
        variant === "info" && styles.infoContainer,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "error" && styles.errorText,
          variant === "success" && styles.successText,
          variant === "info" && styles.infoText,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 5,
  },
  errorContainer: {
    backgroundColor: "#fff1f1",
    borderColor: "#f3c3c3",
  },
  successContainer: {
    backgroundColor: "#edfdf3",
    borderColor: "#b7ebc6",
  },
  infoContainer: {
    backgroundColor: "#eef6ff",
    borderColor: "#c7defa",
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: "#8a1c1c",
  },
  successText: {
    color: "#18603d",
  },
  infoText: {
    color: "#174a7c",
  },
});

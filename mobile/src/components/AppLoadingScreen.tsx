import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type AppLoadingScreenProps = {
  title?: string;
  message?: string;
};

export function AppLoadingScreen({
  title = "Carregando",
  message = "Preparando seu ambiente...",
}: AppLoadingScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#1f6feb" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7fb",
    padding: 24,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 32,
    shadowColor: "#102a43",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    width: "100%",
    maxWidth: 320,
  },
  title: {
    color: "#102a43",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 8,
  },
  message: {
    color: "#486581",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
});

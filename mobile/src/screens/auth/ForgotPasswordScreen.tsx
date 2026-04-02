import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetPassword } from "@/src/services/firebase/auth";
import { BackButton } from "@/src/components/BackButton";
import { AppButton } from "@/src/components/AppButton";
import { AppFeedback } from "@/src/components/AppFeedback";
import { getUserFriendlyErrorMessage } from "@/src/utils/errorMessages";
import { useRequireInternet } from "@/src/hooks/useRequireInternet";

export default function ForgotPasswordScreen() {
  const requireInternet = useRequireInternet(
    "Conecte-se para recuperar sua senha.",
  );
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleResetPassword() {
    if (!requireInternet()) {
      return;
    }

    if (!email.trim()) {
      setSuccessMessage("");
      setErrorMessage("Informe o e-mail da sua conta.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await resetPassword(email.trim());
      setSuccessMessage(
        "Se a conta existir, você receberá um link para redefinir sua senha.",
      );
    } catch (error) {
      setErrorMessage(
        getUserFriendlyErrorMessage(
          error,
          "Não foi possível enviar o link de recuperação agora.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <BackButton onPress={() => router.back()} style={styles.backButton} />

        <Text style={styles.title}>Recuperar senha</Text>
        <Text style={styles.subtitle}>
          Informe seu e-mail para receber o link de redefinição.
        </Text>

        <View style={styles.form}>
          {errorMessage ? <AppFeedback message={errorMessage} /> : null}
          {successMessage ? (
            <AppFeedback message={successMessage} variant="success" />
          ) : null}

          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(value) => {
              setEmail(value);
              if (errorMessage) {
                setErrorMessage("");
              }
              if (successMessage) {
                setSuccessMessage("");
              }
            }}
            placeholder="E-mail"
            placeholderTextColor="#7c8b9a"
            style={styles.input}
            value={email}
          />

          <AppButton
            title="Enviar link"
            onPress={handleResetPassword}
            loading={isLoading}
            style={styles.button}
          />

          {successMessage ? (
            <AppButton
              title="Voltar para login"
              onPress={() => router.replace("/login")}
              variant="secondary"
            />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fb",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#102a43",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  backButton: {
    marginBottom: 18,
  },
  title: {
    color: "#102a43",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#486581",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  form: {
    gap: 14,
  },
  input: {
    backgroundColor: "#f8fbff",
    borderColor: "#d9e2ec",
    borderRadius: 14,
    borderWidth: 1,
    color: "#102a43",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#1f6feb",
    borderRadius: 14,
    marginTop: 8,
    paddingVertical: 16,
  },
});

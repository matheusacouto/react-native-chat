import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetPassword } from "@/src/services/firebase/auth";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleResetPassword() {
    if (!email.trim()) {
      Alert.alert("E-mail obrigatório", "Informe o e-mail da sua conta.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email.trim());
      Alert.alert(
        "E-mail enviado",
        "Se a conta existir, você receberá um link para redefinir sua senha.",
        [
          {
            text: "Voltar para login",
            onPress: () => router.replace("/login"),
          },
        ],
      );
    } catch {
      Alert.alert(
        "Não foi possível enviar",
        "Confira o e-mail informado e tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonArrow}>‹</Text>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>

        <Text style={styles.title}>Recuperar senha</Text>
        <Text style={styles.subtitle}>
          Informe seu e-mail para receber o link de redefinição.
        </Text>

        <View style={styles.form}>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="E-mail"
            placeholderTextColor="#7c8b9a"
            style={styles.input}
            value={email}
          />

          <Pressable
            disabled={isLoading}
            onPress={handleResetPassword}
            style={[styles.button, isLoading && styles.buttonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Enviar link</Text>
            )}
          </Pressable>
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
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonArrow: {
    color: "#1f6feb",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 20,
  },
  backButtonText: {
    color: "#102a43",
    fontSize: 14,
    fontWeight: "700",
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
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});

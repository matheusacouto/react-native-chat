import { AuthContext } from "@/src/contexts/AuthContext";
import { useConnectivity } from "@/src/contexts/ConnectivityContext";
import { useContext, useState } from "react";
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
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";

import { Redirect, router } from "expo-router";

export default function LoginScreen() {
  const { signIn, signInWithGoogle, isLoading, isAuthenticated } =
    useContext(AuthContext);
  const { isOnline } = useConnectivity();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  function canProceedWithOnlineAction() {
    if (isOnline) {
      return true;
    }

    Alert.alert("Sem internet", "Conecte-se para continuar.");
    return false;
  }

  async function handleLogin() {
    if (!canProceedWithOnlineAction()) {
      return;
    }

    await signIn(email, password);
    router.replace("/home");
  }

  async function handleGoogleLogin() {
    if (!canProceedWithOnlineAction()) {
      return;
    }

    await signInWithGoogle();
    router.replace("/home");
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>
          Acesse sua conta para continuar no app.
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
          <TextInput
            onChangeText={setPassword}
            placeholder="Senha"
            placeholderTextColor="#7c8b9a"
            secureTextEntry
            style={styles.input}
            value={password}
          />
          <Pressable
            disabled={isLoading}
            onPress={handleLogin}
            style={[styles.button, isLoading && styles.buttonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </Pressable>

          <View style={styles.googleButtonWrapper}>
            <GoogleSigninButton
              style={[styles.googleButton, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            />
          </View>

          <Pressable
            onPress={() => router.push("/forgot-password")}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Esqueci minha senha</Text>
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
  googleButton: {
    alignSelf: "center",
    width: 220,
    height: 48,
  },
  googleButtonWrapper: {
    alignItems: "center",
    marginTop: 4,
  },
  linkButton: {
    alignItems: "center",
    marginTop: 4,
    paddingVertical: 8,
  },
  linkText: {
    color: "#1f6feb",
    fontSize: 14,
    fontWeight: "700",
  },
});

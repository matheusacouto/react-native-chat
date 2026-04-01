import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { getIdToken } from "@/src/services/firebase/auth";
import { sendGlobalNotification } from "@/src/services/api/notifications.service";
import { useConnectivity } from "@/src/contexts/ConnectivityContext";

export default function SendGlobalNotificationScreen() {
  const { isOnline } = useConnectivity();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destinationRoute, setDestinationRoute] = useState("");
  const [icon, setIcon] = useState("");
  const [payload, setPayload] = useState("");

  function canProceedWithOnlineAction() {
    if (isOnline) {
      return true;
    }

    Alert.alert("Sem internet", "Conecte-se para continuar.");
    return false;
  }

  async function handleSendNotification() {
    if (!canProceedWithOnlineAction()) {
      return;
    }

    if (!title.trim() || !description.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha título e descrição.");
      return;
    }

    const idToken = await getIdToken();

    if (!idToken) {
      Alert.alert("Sessão inválida", "Faça login novamente.");
      return;
    }

    await sendGlobalNotification(idToken, {
      title,
      description,
      icon: icon || null,
      destinationRoute: destinationRoute || null,
      payload: payload ? { raw: payload } : null,
    });

    Alert.alert("Sucesso", "Notificação global enviada.");
    router.back();
  }

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </Pressable>

      <Text style={styles.title}>Envio global</Text>
      <Text style={styles.subtitle}>
        Envie uma notificação para todos os usuários ativos.
      </Text>

      <View style={styles.form}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Título"
          style={styles.input}
        />

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Descrição"
          style={[styles.input, styles.multilineInput]}
          multiline
        />

        <TextInput
          value={destinationRoute}
          onChangeText={setDestinationRoute}
          placeholder="Rota de destino"
          style={styles.input}
        />

        <TextInput
          value={icon}
          onChangeText={setIcon}
          placeholder="Ícone (opcional)"
          style={styles.input}
        />

        <TextInput
          value={payload}
          onChangeText={setPayload}
          placeholder="Payload (opcional)"
          style={[styles.input, styles.multilineInput]}
          multiline
        />

        <Pressable onPress={handleSendNotification} style={styles.button}>
          <Text style={styles.buttonText}>Enviar notificação</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fb",
    padding: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backButtonText: {
    color: "#1f6feb",
    fontSize: 15,
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
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#1f6feb",
    borderRadius: 14,
    marginTop: 8,
    paddingVertical: 16,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});

import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { getIdToken } from "@/src/services/firebase/auth";
import { sendGlobalNotification } from "@/src/services/api/notifications.service";
import { useRequireInternet } from "@/src/hooks/useRequireInternet";
import { BackButton } from "@/src/components/BackButton";
import { NotificationFormFields } from "@/src/components/notifications/NotificationFormFields";
import { AppButton } from "@/src/components/AppButton";

export default function SendGlobalNotificationScreen() {
  const requireInternet = useRequireInternet();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destinationRoute, setDestinationRoute] = useState("");
  const [icon, setIcon] = useState("");

  async function handleSendNotification() {
    if (!requireInternet()) {
      return;
    }

    if (!title.trim() || !description.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha título e descrição.");
      return;
    }

    if (!destinationRoute.trim()) {
      Alert.alert(
        "Rota obrigatória",
        "Selecione uma rota de destino antes de enviar a notificação.",
      );
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
      payload: null,
    });

    Alert.alert("Sucesso", "Notificação global enviada.");
    router.back();
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={() => router.back()} style={styles.backButton} />

      <Text style={styles.title}>Envio global</Text>
      <Text style={styles.subtitle}>
        Envie uma notificação para todos os usuários ativos.
      </Text>

      <NotificationFormFields
        title={title}
        description={description}
        destinationRoute={destinationRoute}
        icon={icon}
        onChangeTitle={setTitle}
        onChangeDescription={setDescription}
        onChangeDestinationRoute={setDestinationRoute}
        onChangeIcon={setIcon}
      />

      <AppButton
        title="Enviar notificação"
        onPress={handleSendNotification}
        style={styles.button}
      />
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
    marginBottom: 16,
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
  button: {
    alignItems: "center",
    backgroundColor: "#1f6feb",
    borderRadius: 14,
    marginTop: 16,
    paddingVertical: 16,
  },
});

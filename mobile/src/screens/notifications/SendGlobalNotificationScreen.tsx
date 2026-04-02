import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { getIdToken } from "@/src/services/firebase/auth";
import { sendGlobalNotification } from "@/src/services/api/notifications.service";
import { useRequireInternet } from "@/src/hooks/useRequireInternet";
import { BackButton } from "@/src/components/BackButton";
import { NotificationFormFields } from "@/src/components/notifications/NotificationFormFields";
import { AppButton } from "@/src/components/AppButton";
import { AppFeedback } from "@/src/components/AppFeedback";
import { getUserFriendlyErrorMessage } from "@/src/utils/errorMessages";

export default function SendGlobalNotificationScreen() {
  const requireInternet = useRequireInternet();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destinationRoute, setDestinationRoute] = useState("");
  const [icon, setIcon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    variant: "error" | "success";
  } | null>(null);

  async function handleSendNotification() {
    if (!requireInternet()) {
      return;
    }

    if (!title.trim() || !description.trim()) {
      setFeedback({
        message: "Preencha título e descrição antes de enviar.",
        variant: "error",
      });
      return;
    }

    if (!destinationRoute.trim()) {
      setFeedback({
        message: "Selecione uma rota de destino antes de enviar.",
        variant: "error",
      });
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);

    try {
      const idToken = await getIdToken();

      if (!idToken) {
        setFeedback({
          message: "Sua sessão não é mais válida. Entre novamente.",
          variant: "error",
        });
        return;
      }

      await sendGlobalNotification(idToken, {
        title,
        description,
        icon: icon || null,
        destinationRoute: destinationRoute || null,
        payload: null,
      });

      setFeedback({
        message: "Notificação global enviada com sucesso.",
        variant: "success",
      });

      setTimeout(() => {
        router.back();
      }, 700);
    } catch (error) {
      setFeedback({
        message: getUserFriendlyErrorMessage(
          error,
          "Não foi possível enviar a notificação global agora.",
        ),
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={() => router.back()} style={styles.backButton} />

      <Text style={styles.title}>Envio global</Text>
      <Text style={styles.subtitle}>
        Envie uma notificação para todos os usuários ativos.
      </Text>

      {feedback ? (
        <AppFeedback message={feedback.message} variant={feedback.variant} />
      ) : null}

      <NotificationFormFields
        title={title}
        description={description}
        destinationRoute={destinationRoute}
        icon={icon}
        onChangeTitle={(value) => {
          setTitle(value);
          if (feedback) {
            setFeedback(null);
          }
        }}
        onChangeDescription={(value) => {
          setDescription(value);
          if (feedback) {
            setFeedback(null);
          }
        }}
        onChangeDestinationRoute={(value) => {
          setDestinationRoute(value);
          if (feedback) {
            setFeedback(null);
          }
        }}
        onChangeIcon={setIcon}
      />

      <AppButton
        title="Enviar notificação"
        onPress={handleSendNotification}
        loading={isSubmitting}
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

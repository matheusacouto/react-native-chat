import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "@/src/navigation/router";
import { getIdToken } from "@/src/services/firebase/auth";
import { getUsers } from "@/src/services/api/users.service";
import { sendIndividualNotification } from "@/src/services/api/notifications.service";
import { UserModel } from "@/src/models/user";
import { useAuth } from "@/src/hooks/useAuth";
import { useRequireInternet } from "@/src/hooks/useRequireInternet";
import { BackButton } from "@/src/components/BackButton";
import { NotificationFormFields } from "@/src/components/notifications/NotificationFormFields";
import { AppButton } from "@/src/components/AppButton";
import { AppFeedback } from "@/src/components/AppFeedback";
import { getUserFriendlyErrorMessage } from "@/src/utils/errorMessages";

export default function SendIndividualNotificationScreen() {
  const { user } = useAuth();
  const requireInternet = useRequireInternet();

  const [users, setUsers] = useState<UserModel[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false);
  const [nextUsersCursor, setNextUsersCursor] = useState<number | null>(null);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destinationRoute, setDestinationRoute] = useState("");
  const [icon, setIcon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    variant: "error" | "success";
  } | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        if (!requireInternet("Conecte-se para carregar usuários.")) {
          return;
        }

        const idToken = await getIdToken();

        if (!idToken) {
          return;
        }

        const response = await getUsers(idToken);
        setUsers(response.data.filter((item) => item.id !== user?.id));
        setNextUsersCursor(response.nextCursor);
        setHasMoreUsers(response.hasMore);
      } catch (error) {
        setFeedback({
          message: getUserFriendlyErrorMessage(
            error,
            "Não foi possível carregar os usuários agora.",
          ),
          variant: "error",
        });
      } finally {
        setIsLoadingUsers(false);
      }
    }

    loadUsers();
  }, [requireInternet, user?.id]);

  async function loadMoreUsers() {
    if (isLoadingMoreUsers || !hasMoreUsers || !nextUsersCursor) {
      return;
    }

    if (!requireInternet("Conecte-se para carregar mais usuários.")) {
      return;
    }

    const idToken = await getIdToken();

    if (!idToken) {
      return;
    }

    setIsLoadingMoreUsers(true);

    try {
      const response = await getUsers(idToken, {
        cursor: nextUsersCursor,
      });

      setUsers((current) => [
        ...current,
        ...response.data.filter((item) => item.id !== user?.id),
      ]);
      setNextUsersCursor(response.nextCursor);
      setHasMoreUsers(response.hasMore);
    } catch (error) {
      setFeedback({
        message: getUserFriendlyErrorMessage(
          error,
          "Não foi possível carregar mais usuários agora.",
        ),
        variant: "error",
      });
    } finally {
      setIsLoadingMoreUsers(false);
    }
  }

  async function handleSendNotification() {
    if (!requireInternet()) {
      return;
    }

    if (!selectedUserId) {
      setFeedback({
        message: "Selecione um destinatário antes de enviar.",
        variant: "error",
      });
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

      await sendIndividualNotification(idToken, {
        title,
        description,
        recipientId: selectedUserId,
        icon: icon || null,
        destinationRoute: destinationRoute || null,
        payload: null,
      });

      setFeedback({
        message: "Notificação individual enviada com sucesso.",
        variant: "success",
      });

      setTimeout(() => {
        router.back();
      }, 700);
    } catch (error) {
      setFeedback({
        message: getUserFriendlyErrorMessage(
          error,
          "Não foi possível enviar a notificação individual agora.",
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

      <Text style={styles.title}>Envio individual</Text>
      <Text style={styles.subtitle}>
        Selecione um usuário e envie a notificação.
      </Text>

      {feedback ? (
        <AppFeedback message={feedback.message} variant={feedback.variant} />
      ) : null}

      <Text style={styles.userLabel}>Destinatário</Text>

      <View style={styles.userListContainer}>
        {isLoadingUsers ? (
          <Text style={styles.helperText}>Carregando usuários...</Text>
        ) : users.length === 0 ? (
          <Text style={styles.helperText}>
            Nenhum destinatário disponível no momento.
          </Text>
        ) : (
          <FlatList
            data={users}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.userList}
            keyExtractor={(item) => String(item.id)}
            onEndReached={loadMoreUsers}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              isLoadingMoreUsers ? (
                <Text style={styles.helperText}>Carregando...</Text>
              ) : null
            }
            renderItem={({ item }) => {
              const isSelected = selectedUserId === item.id;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedUserId(item.id)}
                  style={[
                    styles.userChip,
                    isSelected && styles.userChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.userChipText,
                      isSelected && styles.userChipTextSelected,
                    ]}
                  >
                    {item.nome ?? item.email}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>

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
    marginBottom: 20,
  },
  userLabel: {
    color: "#102a43",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  userList: {
    gap: 10,
    paddingRight: 12,
  },
  userListContainer: {
    justifyContent: "center",
    marginBottom: 12,
  },
  userChip: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userChipSelected: {
    backgroundColor: "#1f6feb",
    borderColor: "#1f6feb",
  },
  userChipText: {
    color: "#102a43",
    fontWeight: "600",
  },
  userChipTextSelected: {
    color: "#ffffff",
  },
  selectedUserText: {
    color: "#486581",
    fontSize: 14,
    marginBottom: 20,
  },
  helperText: {
    color: "#486581",
    fontSize: 14,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#1f6feb",
    borderRadius: 14,
    marginTop: 16,
    paddingVertical: 16,
  },
});

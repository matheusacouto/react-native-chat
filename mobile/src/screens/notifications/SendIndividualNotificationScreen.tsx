import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { getIdToken } from "@/src/services/firebase/auth";
import { getUsers } from "@/src/services/api/users.service";
import { sendIndividualNotification } from "@/src/services/api/notifications.service";
import { UserModel } from "@/src/models/user";
import { useAuth } from "@/src/hooks/useAuth";
import { useRequireInternet } from "@/src/hooks/useRequireInternet";
import { BackButton } from "@/src/components/BackButton";
import { NotificationFormFields } from "@/src/components/notifications/NotificationFormFields";
import { AppButton } from "@/src/components/AppButton";

export default function SendIndividualNotificationScreen() {
  const { user } = useAuth();
  const requireInternet = useRequireInternet();

  const [users, setUsers] = useState<UserModel[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destinationRoute, setDestinationRoute] = useState("");
  const [icon, setIcon] = useState("");

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

        const data: UserModel[] = await getUsers(idToken);
        setUsers(data.filter((item) => item.id !== user?.id));
      } finally {
        setIsLoadingUsers(false);
      }
    }

    loadUsers();
  }, [requireInternet, user?.id]);

  async function handleSendNotification() {
    if (!requireInternet()) {
      return;
    }

    if (!selectedUserId) {
      Alert.alert("Destinatário obrigatório", "Selecione um usuário.");
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

    await sendIndividualNotification(idToken, {
      title,
      description,
      recipientId: selectedUserId,
      icon: icon || null,
      destinationRoute: destinationRoute || null,
      payload: null,
    });

    Alert.alert("Sucesso", "Notificação individual enviada.");
    router.back();
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton onPress={() => router.back()} style={styles.backButton} />

      <Text style={styles.title}>Envio individual</Text>
      <Text style={styles.subtitle}>
        Selecione um usuário e envie a notificação.
      </Text>

      <Text style={styles.userLabel}>Destinatário</Text>

      <View style={styles.userListContainer}>
        {isLoadingUsers ? (
          <Text style={styles.helperText}>Carregando usuários...</Text>
        ) : users.length === 0 ? (
          <Text style={styles.helperText}>
            Nenhum destinatário disponível no momento.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.userList}
          >
            {users.map((item) => {
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
            })}
          </ScrollView>
        )}
      </View>

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

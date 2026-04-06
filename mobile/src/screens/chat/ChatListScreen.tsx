import { UserModel } from "@/src/models/user";
import { startConversation } from "@/src/services/api/chat.service";
import { getUsers } from "@/src/services/api/users.service";
import { getIdToken } from "@/src/services/firebase/auth";
import { router } from "@/src/navigation/router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/hooks/useAuth";
import { BackButton } from "@/src/components/BackButton";
import { AppLoadingScreen } from "@/src/components/AppLoadingScreen";

export default function ChatListScreen() {
  const { user } = useAuth();

  const [users, setUsers] = useState<UserModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const idToken = await getIdToken();

        if (!idToken) {
          return;
        }

        const data = await getUsers(idToken);
        setUsers(data);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  async function handleOpenChat(targetUser: UserModel) {
    if (!user) {
      return;
    }

    const conversation = await startConversation(user.id, targetUser.id);

    router.push({
      name: "ChatRoom",
      params: {
        conversationId: String(conversation.id),
        targetUserId: String(targetUser.id),
        targetUserName: targetUser.nome ?? targetUser.email,
      },
    });
  }

  if (isLoading) {
    return (
      <AppLoadingScreen
        title="Carregando chat"
        message="Buscando usuários disponíveis para conversar."
      />
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} style={styles.backButton} />
        <Text style={styles.title}>Chat</Text>
      </View>

      <FlatList
        data={users.filter((item) => item.id !== user?.id)}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleOpenChat(item)}
            style={styles.card}
          >
            <Text style={styles.name}>{item.nome ?? "Usuário sem nome"}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.message}>Nenhum usuário encontrado.</Text>
        }
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
  header: {
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 14,
    shadowColor: "#102a43",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    color: "#102a43",
    fontSize: 28,
    fontWeight: "700",
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#102a43",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  name: {
    color: "#102a43",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  email: {
    color: "#486581",
    fontSize: 14,
  },
  message: {
    color: "#486581",
    fontSize: 15,
  },
});

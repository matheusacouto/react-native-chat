import { AuthContext } from "@/src/contexts/AuthContext";
import { UserModel } from "@/src/models/user";
import { startConversation } from "@/src/services/api/chat.service";
import { getUsers } from "@/src/services/api/users.service";
import { getIdToken } from "@/src/services/firebase/auth";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatListScreen() {
  const { user } = useContext(AuthContext);

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

  async function handleOpenChat(targetUserId: number) {
    if (!user) {
      return;
    }

    const conversation = await startConversation(user.id, targetUserId);

    router.push(
      `/chat-room?conversationId=${conversation.id}&targetUserId=${targetUserId}`,
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonArrow}>‹</Text>
            <Text style={styles.backButtonText}>Voltar</Text>
          </Pressable>
          <Text style={styles.title}>Chat</Text>
        </View>
        <Text style={styles.message}>Carregando usuários...</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonArrow}>‹</Text>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
        <Text style={styles.title}>Chat</Text>
      </View>

      <FlatList
        data={users.filter((item) => item.id !== user?.id)}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleOpenChat(item.id)}
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
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#102a43",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
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

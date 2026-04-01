import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import {
  getConversationMessages,
  sendMessage,
} from "@/src/services/api/chat.service";
import { MessageModel } from "@/src/models/message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/hooks/useAuth";
import { useRequireInternet } from "@/src/hooks/useRequireInternet";
import { BackButton } from "@/src/components/BackButton";
import { AppButton } from "@/src/components/AppButton";

export default function ChatRoomScreen() {
  const { user } = useAuth();
  const requireInternet = useRequireInternet("Conecte-se para enviar mensagens.");

  const { conversationId, targetUserId } = useLocalSearchParams<{
    conversationId: string;
    targetUserId: string;
  }>();

  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      try {
        if (!conversationId) {
          return;
        }

        const data = await getConversationMessages(Number(conversationId));
        setMessages(data);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, [conversationId]);

  async function handleSendMessage() {
    if (!user || !targetUserId || !text.trim()) {
      return;
    }

    if (!requireInternet()) {
      return;
    }

    const newMessage = await sendMessage(user.id, Number(targetUserId), text);

    setMessages((current) => [...current, newMessage]);
    setText("");
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} style={styles.backButton} />
          <Text style={styles.title}>Conversa</Text>
        </View>
        <Text style={styles.message}>Carregando mensagens...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} style={styles.backButton} />
        <Text style={styles.title}>Conversa</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageCard,
              item.remetente.id === user?.id
                ? styles.myMessage
                : styles.otherMessage,
            ]}
          >
            <Text style={styles.sender}>
              {item.remetente.nome ?? item.remetente.email}
            </Text>
            <Text style={styles.text}>{item.mensagem}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.message}>Nenhuma mensagem encontrada.</Text>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Digite sua mensagem"
          style={styles.input}
        />
        <AppButton
          title="Enviar"
          onPress={handleSendMessage}
          style={styles.sendButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fb",
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 12,
    shadowColor: "#102a43",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    color: "#102a43",
    fontSize: 24,
    fontWeight: "700",
  },
  listContent: {
    gap: 12,
    paddingBottom: 16,
  },
  messageCard: {
    borderRadius: 16,
    padding: 14,
    maxWidth: "82%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#d9ecff",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
  },
  sender: {
    color: "#486581",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  text: {
    color: "#102a43",
    fontSize: 15,
    lineHeight: 22,
  },
  message: {
    color: "#486581",
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sendButton: {
    paddingHorizontal: 18,
    paddingVertical: 0,
  },
});

import { useContext, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
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
import { AuthContext } from "@/src/contexts/AuthContext";
import { useConnectivity } from "@/src/contexts/ConnectivityContext";

export default function ChatRoomScreen() {
  const { user } = useContext(AuthContext);
  const { isOnline } = useConnectivity();

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

    if (!isOnline) {
      Alert.alert("Sem internet", "Conecte-se para enviar mensagens.");
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
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonArrow}>‹</Text>
            <Text style={styles.backButtonText}>Voltar</Text>
          </Pressable>
          <Text style={styles.title}>Conversa</Text>
        </View>
        <Text style={styles.message}>Carregando mensagens...</Text>
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
        <Pressable onPress={handleSendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </Pressable>
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
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
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
    backgroundColor: "#1f6feb",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  sendButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});

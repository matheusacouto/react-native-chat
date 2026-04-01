import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { getIdToken } from "@/src/services/firebase/auth";
import {
  getNotifications,
  markNotificationAsRead,
} from "@/src/services/api/notifications.service";
import { NotificationItem } from "@/src/models/notification";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const idToken = await getIdToken();

        if (!idToken) {
          return;
        }

        const data = await getNotifications(idToken);
        setNotifications(data);
      } finally {
        setIsLoading(false);
      }
    }

    loadNotifications();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonArrow}>‹</Text>
            <Text style={styles.backButtonText}>Voltar</Text>
          </Pressable>
          <Text style={styles.title}>Notificações</Text>
        </View>
        <Text style={styles.message}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  async function handlePressNotification(item: NotificationItem) {
    const idToken = await getIdToken();

    if (!idToken) {
      return;
    }

    if (!item.lida) {
      const updatedNotification = await markNotificationAsRead(
        item.id,
        idToken,
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id ? updatedNotification : notification,
        ),
      );
    }

    if (item.notificacao.rota_destino) {
      router.push(item.notificacao.rota_destino as never);
    }
  }

  async function handleMarkAsRead(idToken: string, recipientId: number) {
    const updatedNotification = await markNotificationAsRead(
      recipientId,
      idToken,
    );

    setNotifications((current) =>
      current.map((item) =>
        item.id === recipientId ? updatedNotification : item,
      ),
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonArrow}>‹</Text>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
        <Text style={styles.title}>Notificações</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.message}>Nenhuma notificação encontrada.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => handlePressNotification(item)}
          >
            <Text style={styles.cardTitle}>{item.notificacao.titulo}</Text>
            <Text style={styles.cardDescription}>
              {item.notificacao.descricao}
            </Text>
            <Text style={styles.cardStatus}>
              {item.lida ? "Lida" : "Não lida"}
            </Text>
          </Pressable>
        )}
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
  cardTitle: {
    color: "#102a43",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardDescription: {
    color: "#486581",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  cardStatus: {
    color: "#7b8794",
    fontSize: 12,
    fontWeight: "600",
  },
  message: {
    color: "#486581",
    fontSize: 15,
  },
});

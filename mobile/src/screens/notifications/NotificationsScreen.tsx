import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { getIdToken } from "@/src/services/firebase/auth";
import {
  getNotifications,
  markNotificationAsRead,
} from "@/src/services/api/notifications.service";
import { NotificationItem } from "@/src/models/notification";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "@/src/navigation/router";
import { useRequireInternet } from "@/src/hooks/useRequireInternet";
import { BackButton } from "@/src/components/BackButton";
import { AppLoadingScreen } from "@/src/components/AppLoadingScreen";

export default function NotificationsScreen() {
  const requireInternet = useRequireInternet();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        if (!requireInternet("Conecte-se para carregar notificações.")) {
          return;
        }

        const idToken = await getIdToken();

        if (!idToken) {
          return;
        }

        const response = await getNotifications(idToken);
        setNotifications(response.data);
        setNextCursor(response.nextCursor);
        setHasMore(response.hasMore);
      } finally {
        setIsLoading(false);
      }
    }

    loadNotifications();
  }, [requireInternet]);

  async function loadMoreNotifications() {
    if (isLoadingMore || !hasMore || !nextCursor) {
      return;
    }

    if (!requireInternet("Conecte-se para carregar mais notificações.")) {
      return;
    }

    const idToken = await getIdToken();

    if (!idToken) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const response = await getNotifications(idToken, {
        cursor: nextCursor,
      });

      setNotifications((current) => [...current, ...response.data]);
      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } finally {
      setIsLoadingMore(false);
    }
  }

  if (isLoading) {
    return (
      <AppLoadingScreen
        title="Carregando notificações"
        message="Buscando seus avisos mais recentes."
      />
    );
  }

  async function handlePressNotification(item: NotificationItem) {
    if (!requireInternet("Conecte-se para abrir notificações.")) {
      return;
    }

    const idToken = await getIdToken();

    if (!idToken) {
      return;
    }

    if (!item.lida) {
      const updatedNotification = await markNotificationAsRead(
        idToken,
        item.id,
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} style={styles.backButton} />
        <Text style={styles.title}>Notificações</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMoreNotifications}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isLoadingMore ? (
            <Text style={styles.message}>Carregando mais notificações...</Text>
          ) : null
        }
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

import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { ConnectivityProvider } from "@/src/contexts/ConnectivityContext";
import { useAuth } from "@/src/hooks/useAuth";
import {
  PushNotification,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from "@/src/services/firebase/push";
import { AppNavigator } from "@/src/navigation/AppNavigator";
import { isCurrentRoute, router } from "@/src/navigation/router";

type ForegroundNotification = {
  title: string;
  body: string;
  route: string | null;
};

function getRouteFromNotification(notification: PushNotification) {
  const data = notification.notification.request.content.data;
  const route = data?.rota_destino;

  if (typeof route !== "string" || route.trim().length === 0) {
    return null;
  }

  return route.trim();
}

function ForegroundNotificationBanner({
  notification,
  onDismiss,
}: {
  notification: ForegroundNotification | null;
  onDismiss: () => void;
}) {
  if (!notification) {
    return null;
  }

  function handlePress() {
    if (notification?.route) {
      router.push(notification.route);
    }

    onDismiss();
  }

  return (
    <View pointerEvents="box-none" style={styles.bannerContainer}>
      <Pressable
        accessibilityRole="button"
        onPress={handlePress}
        style={styles.banner}
      >
        <Text style={styles.bannerTitle}>{notification.title}</Text>
        {notification.body ? (
          <Text style={styles.bannerBody}>{notification.body}</Text>
        ) : null}
      </Pressable>
    </View>
  );
}

export function AppShell() {
  const { isAuthenticated, isLoading } = useAuth();
  const [pendingNotificationRoute, setPendingNotificationRoute] = useState<
    string | null
  >(null);
  const [foregroundNotification, setForegroundNotification] =
    useState<ForegroundNotification | null>(null);

  useEffect(() => {
    const subscription = addNotificationResponseListener((response) => {
      if (!isLoading && !isAuthenticated) {
        return;
      }

      const route = getRouteFromNotification(response);

      if (route) {
        setPendingNotificationRoute(route);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    const subscription = addNotificationReceivedListener((notification) => {
      if (isLoading || !isAuthenticated) {
        return;
      }

      const route = getRouteFromNotification(notification);

      if (route && isCurrentRoute(route)) {
        return;
      }

      setForegroundNotification({
        title:
          notification.notification.request.content.title ?? "Nova notificação",
        body: notification.notification.request.content.body ?? "",
        route,
      });
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!foregroundNotification) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setForegroundNotification(null);
    }, 6000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [foregroundNotification]);

  useEffect(() => {
    if (!pendingNotificationRoute || isLoading || !isAuthenticated) {
      return;
    }

    router.push(pendingNotificationRoute);
    setPendingNotificationRoute(null);
  }, [isAuthenticated, isLoading, pendingNotificationRoute]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setPendingNotificationRoute(null);
      setForegroundNotification(null);
    }
  }, [isAuthenticated, isLoading]);

  return (
    <>
      <AppNavigator />
      <ForegroundNotificationBanner
        notification={foregroundNotification}
        onDismiss={() => setForegroundNotification(null)}
      />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ConnectivityProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ConnectivityProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    left: 16,
    position: "absolute",
    right: 16,
    top: 48,
    zIndex: 100,
  },
  banner: {
    backgroundColor: "#101827",
    borderRadius: 8,
    elevation: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000000",
    shadowOffset: {
      height: 3,
      width: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  bannerTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  bannerBody: {
    color: "#d8dee9",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});

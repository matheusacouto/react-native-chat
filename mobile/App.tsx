import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { ConnectivityProvider } from "@/src/contexts/ConnectivityContext";
import { useAuth } from "@/src/hooks/useAuth";
import { addNotificationResponseListener } from "@/src/services/firebase/push";
import { AppNavigator } from "@/src/navigation/AppNavigator";
import { router } from "@/src/navigation/router";

export function AppShell() {
  const { isAuthenticated, isLoading } = useAuth();
  const [pendingNotificationRoute, setPendingNotificationRoute] = useState<
    string | null
  >(null);

  useEffect(() => {
    const subscription = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      const route = data?.rota_destino;

      if (typeof route === "string" && route.length > 0) {
        setPendingNotificationRoute(route.trim());
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!pendingNotificationRoute || isLoading || !isAuthenticated) {
      return;
    }

    router.push(pendingNotificationRoute);
    setPendingNotificationRoute(null);
  }, [isAuthenticated, isLoading, pendingNotificationRoute]);

  return <AppNavigator />;
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

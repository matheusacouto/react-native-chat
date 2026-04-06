import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { ConnectivityProvider } from "@/src/contexts/ConnectivityContext";
import { addNotificationResponseListener } from "@/src/services/firebase/push";
import { AppNavigator } from "@/src/navigation/AppNavigator";
import { router } from "@/src/navigation/router";

function AppShell() {
  useEffect(() => {
    const subscription = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      const route = data?.rota_destino;

      if (typeof route === "string" && route.length > 0) {
        router.push(route);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

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

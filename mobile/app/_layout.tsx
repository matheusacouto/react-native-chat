import { AuthProvider } from "@/src/contexts/AuthContext";
import { ConnectivityProvider } from "@/src/contexts/ConnectivityContext";
import { addNotificationResponseListener } from "@/src/services/firebase/push";
import { router, Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    const subscription = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      const route = data?.rota_destino;

      if (typeof route === "string" && route.length > 0) {
        router.push(route as never);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ConnectivityProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </ConnectivityProvider>
  );
}

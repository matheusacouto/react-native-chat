import { useContext } from "react";
import { AuthContext } from "@/src/contexts/AuthContext";
import { Redirect } from "expo-router";
import { AppLoadingScreen } from "@/src/components/AppLoadingScreen";

export default function Index() {
  const { isLoading, isAuthenticated } = useContext(AuthContext);

  if (isLoading) {
    return (
      <AppLoadingScreen
        title="Carregando aplicativo"
        message="Validando sua sessão e preparando a navegação."
      />
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/login" />;
}

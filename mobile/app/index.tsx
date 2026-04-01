import { useContext } from "react";
import { View, Text } from "react-native";
import { AuthContext } from "@/src/contexts/AuthContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { isLoading, isAuthenticated } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View>
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/login" />;
}

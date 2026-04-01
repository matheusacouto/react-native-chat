import { AuthContext } from "@/src/contexts/AuthContext";
import { Redirect, router } from "expo-router";
import { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user, signOut, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Você entrou com sucesso no app.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Usuário autenticado</Text>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.value}>{user?.nome ?? "Não informado"}</Text>

        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.value}>{user?.email ?? "Não informado"}</Text>

        <Text style={styles.label}>Firebase UID</Text>
        <Text style={styles.uid}>{user?.firebase_uid ?? "Não informado"}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/notification")}
        >
          <Text style={styles.secondaryButtonText}>Notificações</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/chat")}
        >
          <Text style={styles.secondaryButtonText}>Chat</Text>
        </Pressable>

        <Pressable onPress={signOut} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Sair</Text>
        </Pressable>
      </View>
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
    marginBottom: 24,
  },
  title: {
    color: "#102a43",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#486581",
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#102a43",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  sectionTitle: {
    color: "#102a43",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  label: {
    color: "#7b8794",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
  },
  value: {
    color: "#102a43",
    fontSize: 16,
    marginTop: 4,
  },
  uid: {
    color: "#243b53",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: "#102a43",
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#d64545",
    borderRadius: 14,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});

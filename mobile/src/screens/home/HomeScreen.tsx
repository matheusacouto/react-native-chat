import { Redirect, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/hooks/useAuth";
import { AppButton } from "@/src/components/AppButton";
import { useAppParameters } from "@/src/hooks/useAppParameters";

export default function HomeScreen() {
  const { user, signOut, isAuthenticated } = useAuth();
  const { parameters, parameterMap, isLoading } = useAppParameters();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const homeTitle = parameterMap.home_title ?? "Home";
  const homeSubtitle =
    parameterMap.home_subtitle ?? "Você entrou com sucesso no app.";
  const appNotice = parameterMap.home_notice;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{homeTitle}</Text>
        <Text style={styles.subtitle}>{homeSubtitle}</Text>
      </View>

      {appNotice ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Aviso do app</Text>
          <Text style={styles.noticeText}>{appNotice}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Usuário autenticado</Text>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.value}>{user?.nome ?? "Não informado"}</Text>

        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.value}>{user?.email ?? "Não informado"}</Text>

        <Text style={styles.label}>Firebase UID</Text>
        <Text style={styles.uid}>{user?.firebase_uid ?? "Não informado"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Parâmetros ativos do app</Text>
        {isLoading ? (
          <Text style={styles.emptyState}>Carregando parâmetros...</Text>
        ) : parameters.length ? (
          parameters.map((parameter) => (
            <View key={parameter.id} style={styles.parameterRow}>
              <Text style={styles.label}>{parameter.chave}</Text>
              <Text style={styles.value}>{parameter.valor}</Text>
              {parameter.descricao ? (
                <Text style={styles.parameterDescription}>
                  {parameter.descricao}
                </Text>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={styles.emptyState}>
            Nenhum parâmetro ativo encontrado.
          </Text>
        )}
      </View>

      <View style={styles.actions}>
        <AppButton
          title="Notificações"
          variant="secondary"
          onPress={() => router.push("/notification")}
          style={styles.secondaryButton}
        />

        <AppButton
          title="Enviar Notificação Global"
          variant="secondary"
          onPress={() => router.push("/global-notification-form")}
          style={styles.secondaryButton}
        />

        <AppButton
          title="Enviar Notificação Individual"
          variant="secondary"
          onPress={() => router.push("/individual-notification-form")}
          style={styles.secondaryButton}
        />

        <AppButton
          title="Chat"
          variant="secondary"
          onPress={() => router.push("/chat")}
          style={styles.secondaryButton}
        />

        <AppButton
          title="Sair"
          variant="danger"
          onPress={signOut}
          style={styles.primaryButton}
        />
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
  noticeCard: {
    backgroundColor: "#e8f1ff",
    borderColor: "#bfd4f6",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
    padding: 18,
  },
  noticeTitle: {
    color: "#1f3a5f",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  noticeText: {
    color: "#355070",
    fontSize: 14,
    lineHeight: 21,
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
  parameterRow: {
    marginTop: 10,
  },
  parameterDescription: {
    color: "#7b8794",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  emptyState: {
    color: "#486581",
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    gap: 12,
  },
  secondaryButton: {
    paddingVertical: 0,
  },
  primaryButton: {
    paddingVertical: 0,
  },
});

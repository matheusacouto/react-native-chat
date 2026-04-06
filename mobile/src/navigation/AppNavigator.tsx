import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/src/hooks/useAuth";
import LoginScreen from "@/src/screens/auth/LoginScreen";
import ForgotPasswordScreen from "@/src/screens/auth/ForgotPasswordScreen";
import HomeScreen from "@/src/screens/home/HomeScreen";
import NotificationsScreen from "@/src/screens/notifications/NotificationsScreen";
import SendGlobalNotificationScreen from "@/src/screens/notifications/SendGlobalNotificationScreen";
import SendIndividualNotificationScreen from "@/src/screens/notifications/SendIndividualNotificationScreen";
import ChatListScreen from "@/src/screens/chat/ChatListScreen";
import ChatRoomScreen from "@/src/screens/chat/ChatRoomScreen";
import { AppLoadingScreen } from "@/src/components/AppLoadingScreen";
import {
  flushPendingNavigation,
  navigationRef,
} from "@/src/navigation/router";
import { RootStackParamList } from "@/src/navigation/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

function BootScreen() {
  return (
    <AppLoadingScreen
      title="Carregando aplicativo"
      message="Preparando a navegação inicial."
    />
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={flushPendingNavigation}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoading ? (
          <Stack.Screen name="Login" component={BootScreen} />
        ) : isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen
              name="GlobalNotificationForm"
              component={SendGlobalNotificationScreen}
            />
            <Stack.Screen
              name="IndividualNotificationForm"
              component={SendIndividualNotificationScreen}
            />
            <Stack.Screen name="Chat" component={ChatListScreen} />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

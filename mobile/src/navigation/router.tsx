import { useEffect } from "react";
import {
  StackActions,
  createNavigationContainerRef,
  useRoute,
} from "@react-navigation/native";
import { RootStackParamList } from "@/src/navigation/types";

type PathRoute =
  | "/login"
  | "/forgot-password"
  | "/home"
  | "/notification"
  | "/notifications"
  | "/global-notification-form"
  | "/individual-notification-form"
  | "/chat";

type RouterTarget =
  | string
  | {
      name: keyof RootStackParamList;
      params?: RootStackParamList[keyof RootStackParamList];
    };

const pathMap: Record<PathRoute, keyof RootStackParamList> = {
  "/login": "Login",
  "/forgot-password": "ForgotPassword",
  "/home": "Home",
  "/notification": "Notifications",
  "/notifications": "Notifications",
  "/global-notification-form": "GlobalNotificationForm",
  "/individual-notification-form": "IndividualNotificationForm",
  "/chat": "Chat",
};

const routeNames = new Set<keyof RootStackParamList>([
  "Login",
  "ForgotPassword",
  "Home",
  "Notifications",
  "GlobalNotificationForm",
  "IndividualNotificationForm",
  "Chat",
  "ChatRoom",
]);

export const navigationRef = createNavigationContainerRef<RootStackParamList>();
const pendingActions: Array<() => void> = [];

function isPathRoute(target: string): target is PathRoute {
  return target in pathMap;
}

function isRouteName(target: string): target is keyof RootStackParamList {
  return routeNames.has(target as keyof RootStackParamList);
}

function resolveTarget(target: RouterTarget) {
  if (typeof target !== "string") {
    return target;
  }

  if (isPathRoute(target)) {
    return {
      name: pathMap[target],
      params: undefined,
    };
  }

  if (isRouteName(target)) {
    return {
      name: target,
      params: undefined,
    };
  }

  throw new Error(`Rota não mapeada para React Navigation: ${target}`);
}

export const router = {
  back() {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },
  push(target: RouterTarget) {
    const action = () => {
      const resolvedTarget = resolveTarget(target);
      navigationRef.dispatch(
        StackActions.push(resolvedTarget.name, resolvedTarget.params),
      );
    };

    if (!navigationRef.isReady()) {
      pendingActions.push(action);
      return;
    }

    action();
  },
  replace(target: RouterTarget) {
    const action = () => {
      const resolvedTarget = resolveTarget(target);
      navigationRef.dispatch(
        StackActions.replace(resolvedTarget.name, resolvedTarget.params),
      );
    };

    if (!navigationRef.isReady()) {
      pendingActions.push(action);
      return;
    }

    action();
  },
};

export function flushPendingNavigation() {
  while (pendingActions.length > 0) {
    const action = pendingActions.shift();
    action?.();
  }
}

export function Redirect({ href }: { href: PathRoute }) {
  useEffect(() => {
    router.replace(href);
  }, [href]);

  return null;
}

export function useLocalSearchParams<T extends object>() {
  const route = useRoute();

  return (route.params ?? {}) as T;
}

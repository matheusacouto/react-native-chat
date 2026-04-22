import { getApp } from "@react-native-firebase/app";
import {
  AuthorizationStatus,
  FirebaseMessagingTypes,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  requestPermission,
} from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";

type PushNotificationContent = {
  title?: string;
  body?: string;
  data: Record<string, string>;
};

export type PushNotification = {
  notification: {
    request: {
      content: PushNotificationContent;
    };
  };
};

export type PushNotificationResponse = PushNotification;

const messagingInstance = getMessaging(getApp());

function normalizeRemoteMessage(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): PushNotification {
  const normalizedData = Object.entries(remoteMessage.data ?? {}).reduce<
    Record<string, string>
  >((accumulator, [key, value]) => {
    accumulator[key] = typeof value === "string" ? value : JSON.stringify(value);

    return accumulator;
  }, {});

  return {
    notification: {
      request: {
        content: {
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          data: normalizedData,
        },
      },
    },
  };
}

async function requestAndroidNotificationPermission() {
  if (Platform.OS !== "android" || Platform.Version < 33) {
    return true;
  }

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return status === PermissionsAndroid.RESULTS.GRANTED;
}

async function requestNotificationPermission() {
  const hasAndroidPermission = await requestAndroidNotificationPermission();

  if (!hasAndroidPermission) {
    return false;
  }

  if (Platform.OS === "android") {
    return true;
  }

  const authorizationStatus = await requestPermission(messagingInstance);

  return (
    authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

export async function registerForPushNotificationsAsync() {
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return null;
  }

  const token = await getToken(messagingInstance);

  if (!token) {
    return null;
  }

  return {
    data: token,
  };
}

export async function getCurrentPushTokenAsync() {
  const token = await getToken(messagingInstance);

  if (!token) {
    return null;
  }

  return token;
}

export function addNotificationReceivedListener(
  callback: (notification: PushNotification) => void,
) {
  const unsubscribe = onMessage(messagingInstance, (remoteMessage) => {
    callback(normalizeRemoteMessage(remoteMessage));
  });

  return {
    remove: unsubscribe,
  };
}

export function addNotificationResponseListener(
  callback: (response: PushNotificationResponse) => void,
) {
  let isActive = true;

  void getInitialNotification(messagingInstance).then((remoteMessage) => {
    if (!isActive || !remoteMessage) {
      return;
    }

    callback(normalizeRemoteMessage(remoteMessage));
  });

  const unsubscribe = onNotificationOpenedApp(
    messagingInstance,
    (remoteMessage) => {
      callback(normalizeRemoteMessage(remoteMessage));
    },
  );

  return {
    remove() {
      isActive = false;
      unsubscribe();
    },
  };
}

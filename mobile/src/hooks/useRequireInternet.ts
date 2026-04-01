import { useCallback } from "react";
import { Alert } from "react-native";
import { useConnectivity } from "@/src/contexts/ConnectivityContext";

export function useRequireInternet(
  defaultMessage = "Conecte-se para continuar.",
) {
  const { isOnline } = useConnectivity();

  return useCallback(
    (message = defaultMessage) => {
      if (isOnline) {
        return true;
      }

      Alert.alert("Sem internet", message);
      return false;
    },
    [defaultMessage, isOnline],
  );
}

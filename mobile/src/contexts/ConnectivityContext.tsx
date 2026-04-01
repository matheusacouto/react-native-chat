import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { Alert } from "react-native";

type ConnectivityContextData = {
  isOnline: boolean;
};

const ConnectivityContext = createContext<ConnectivityContextData>({
  isOnline: true,
});

type ConnectivityProviderProps = {
  children: ReactNode;
};

export function ConnectivityProvider({ children }: ConnectivityProviderProps) {
  const netInfo = useNetInfo();
  const wasOnlineRef = useRef(true);

  const isOnline = Boolean(
    netInfo.isConnected && netInfo.isInternetReachable !== false,
  );

  useEffect(() => {
    if (wasOnlineRef.current && !isOnline) {
      Alert.alert(
        "Sem internet",
        "Verifique sua conexão. Algumas ações ficarão indisponíveis.",
      );
    }

    wasOnlineRef.current = isOnline;
  }, [isOnline]);

  return (
    <ConnectivityContext.Provider value={{ isOnline }}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  return useContext(ConnectivityContext);
}

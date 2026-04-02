import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
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
  const [hasResolvedConnectivity, setHasResolvedConnectivity] = useState(false);

  const hasKnownConnection =
    netInfo.isConnected !== null && netInfo.isConnected !== undefined;
  const hasKnownReachability = netInfo.isInternetReachable !== undefined;

  const isOnline =
    netInfo.isConnected !== false && netInfo.isInternetReachable !== false;

  useEffect(() => {
    if (hasKnownConnection && hasKnownReachability) {
      setHasResolvedConnectivity(true);
    }
  }, [hasKnownConnection, hasKnownReachability]);

  useEffect(() => {
    if (!hasResolvedConnectivity) {
      return;
    }

    if (wasOnlineRef.current && !isOnline) {
      Alert.alert(
        "Sem internet",
        "Verifique sua conexão. Algumas ações ficarão indisponíveis.",
      );
    }

    wasOnlineRef.current = isOnline;
  }, [hasResolvedConnectivity, isOnline]);

  return (
    <ConnectivityContext.Provider value={{ isOnline }}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  return useContext(ConnectivityContext);
}

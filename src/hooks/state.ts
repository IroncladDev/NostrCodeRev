import { useAtom } from "jotai";
import { ndkAtom, pubKeyAtom, relayAtoms } from "../state";

// Returns setters and getters for all relay-related states
export function useRelay() {
  const [url, setUrl] = useAtom(relayAtoms.url);
  const [status, setStatus] = useAtom(relayAtoms.status);

  return {
    url,
    setUrl,
    status,
    setStatus,
  };
}

// Returns setters and getters for all ndk-related states
export function useNDK() {
  const [ndk, setNDK] = useAtom(ndkAtom);

  return {
    ndk,
    setNDK,
  };
}

// Returns setters and getters for all pubKey-related states
export function usePubKey() {
  const [pubKey, setPubKey] = useAtom(pubKeyAtom);

  return {
    pubKey,
    setPubKey,
  };
}

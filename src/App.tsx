import { useReplit, useThemeValues } from "@replit/extensions-react";
import { useEffect } from "react";
import "./App.css";
import "websocket-polyfill";
import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";
import { HandshakeStatus } from "@replit/extensions";
import { useNDK, usePubKey, useRelay } from "./hooks/state";
import Header from "./components/Header";
import { X } from "react-feather";
import Loader from "./components/Loader";
import { progressAtom, RELAYS } from "./state";
import RelayUnReadyState from "./components/RelayUnReadyState";
import Select from "./components/Select";
import { RequestType, requestTypeAtom } from "./state";
import CodeReview from "./components/CodeReview";
import { useAtom } from "jotai";
import StableDiffusion from "./components/StableDiffusion";

function App() {
  const { status } = useReplit();

  // Synchronize replit's theme with the Extension
  const themeValues = useThemeValues();
  const mappedThemeValues = themeValues
    ? Object.entries(themeValues).map(
        ([key, val]) =>
          `--${key.replace(
            /[A-Z]/g,
            (c) => "-" + c.toLowerCase(),
          )}: ${val} !important;`,
      )
    : [];

  // State Atoms
  const { ndk, setNDK } = useNDK();
  const { status: relayStatus, setStatus, url } = useRelay();
  const { setProgress } = useAtom(progressAtom);
  const { pubKey: pk, setPubKey } = usePubKey();
  const [requestType, setRequestType] = useAtom(requestTypeAtom);

  // Initialize Public Key
  useEffect(() => {
    async function init() {
      if (typeof window.nostr === "undefined") {
        return;
      }
      const pubkey = await window.nostr.getPublicKey();
      setPubKey(pubkey);
    }

    init();
  }, [pk]);

  // Initialize Relay Connection
  useEffect(() => {
    try {
      const signer = new NDKNip07Signer();
      const ndk = new NDK({
        explicitRelayUrls: RELAYS,
        signer,
      });

      ndk.pool.on("relay:connect", async (r: any) => {
        setStatus("Connected");
        console.log(`Connected to a relay ${r.url}`);
      });

      ndk.connect(2500);

      setNDK(ndk);
    } catch (e) {
      console.log("error", e);
    }
  }, [url]);

  if (status === HandshakeStatus.Error) {
    return (
      <div
        className="flex-row"
        css={{ alignItems: "center", justifyContent: "center", flexGrow: 1 }}
      >
        <div
          className="flex-col m8"
          css={{ alignItems: "center", maxWidth: 240 }}
        >
          <X size={48} />
          <h1 css={{ fontSize: 24, fontWeight: 600 }}>Failed to Connect</h1>
          <p css={{ textAlign: "center" }}>
            This extension couldn't establish a connection with Replit.
          </p>
        </div>
      </div>
    );
  } else if (status === HandshakeStatus.Loading) {
    return (
      <div
        className="flex-row"
        css={{ alignItems: "center", justifyContent: "center", flexGrow: 1 }}
      >
        <Loader size={32} />
      </div>
    );
  }

  return (
    <>
      <style>{`:root, .replit-ui-theme-root {
${mappedThemeValues.join("\n")}
        }`}</style>
      <main className="flex-col">
        <Header />

        <div className="flex-col m8 p8">
          {relayStatus !== "Connected" ? <RelayUnReadyState /> : null}

          <div className="flex-col m8">
            <div className="flex-row m8">
              <Select
                options={[
                  ["Code Review", RequestType.CodeReview],
                  ["Stable Diffusion", RequestType.StableDiffusion],
                ]}
                onChange={(e) => {
                  setRequestType(e.target.value as RequestType);
                  setProgress(null);
                }}
                css={{ flexGrow: 1 }}
              />
            </div>
          </div>
        </div>

        {ndk ? (
          <>
            {requestType === RequestType.CodeReview ? (
              <CodeReview ndk={ndk} />
            ) : null}
            {requestType === RequestType.StableDiffusion ? (
              <StableDiffusion ndk={ndk} />
            ) : null}
          </>
        ) : null}
      </main>
    </>
  );
}

export default App;

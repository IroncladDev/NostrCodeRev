import { useReplit, useThemeValues } from "@replit/extensions-react";
import { useState, useEffect } from "react";
import "./App.css";
import "websocket-polyfill";
import NDK, {
  NDKEvent,
  NDKNip07Signer,
  NDKSubscription,
} from "@nostr-dev-kit/ndk";
import type { NostrEvent } from "@nostr-dev-kit/ndk";
import { HandshakeStatus } from "@replit/extensions";
import { useNDK, usePubKey, useRelay } from "./hooks/state";
import Header from "./components/Header";
import { X } from "react-feather";
import Loader from "./components/Loader";
import { progressAtom, ProgressResult, RELAYS } from "./state";
import RelayUnReadyState from "./components/RelayUnReadyState";
import Select from "./components/Select";
import Button from "./components/Button";
import { checkDiffs } from "./lib/diff";
import { DiffFile } from "diff2html/lib/types";
import Diffs from "./components/Diffs";
import { Markdown } from "./components/Markdown";
import { useAtom } from "jotai";
import Progress from "./components/Progress";
import { tokens } from "./ui";

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

  const { ndk, setNDK } = useNDK();
  const { status: relayStatus, setStatus, url } = useRelay();
  const { pubKey: pk, setPubKey } = usePubKey();

  const [progress, setProgress] = useAtom(progressAtom);
  const [eventFeed, setEventFeed] = useState<
    Array<{
      status: ProgressResult;
      event: NDKEvent;
    }>
  >([]);
  const [sub, setSub] = useState<NDKSubscription | null>(null);
  const [diffs, setDiffs] = useState<Array<DiffFile>>([]);

  const handleSubmit = async () => {
    if (!ndk) return;

    const { output } = await checkDiffs();

    const event = new NDKEvent(ndk, {
      kind: 68005,
      tags: [
        ["j", "code-review"],
        ["bid", "10000"],
      ],
      content: `Here is the git diff of my code.  Please provide me with a code review:\n\n${output}`,
    } as NostrEvent);

    await event.sign();

    // check if there is a subscription running here
    if (sub !== null) {
      console.log("already subscribed");
      sub.stop();
    }

    // create a subscription
    const newSub = ndk?.subscribe(
      {
        ...event.filter(),
      },
      { closeOnEose: false, groupable: false },
    );

    setEventFeed([]);

    newSub!.on("event", (event: NDKEvent) => {
      setProgress((p) => {
        let progressType: ProgressResult = p;

        if (
          event.tags.find(
            (x) => x[0] === "status" && x[1] === "payment-required",
          )
        ) {
          progressType = "received";
        } else if (
          event.tags.find((x) => x[0] === "status" && x[1] === "started")
        ) {
          progressType = "started";
        } else if (
          event.tags.find((x) => x[0] === "status" && x[1] === "success")
        ) {
          progressType = "success";
        }

        setEventFeed((prevEventFeed) => [
          ...prevEventFeed,
          {
            event,
            status: progressType,
          },
        ]);

        return progressType;
      });
    });
    setSub(newSub!);

    console.log("signed_event", event.rawEvent());
    await event.publish();
  };
  const handleZap = async (e: NDKEvent) => {
    if (typeof window.webln === "undefined") {
      alert(
        "You need to use a webln enabled browser or extension to zap for these jobs! Download Alby at https://getalby.com !",
      );
      return;
    }

    await window.webln.enable();
    const invoice = e.tags.find((tag) => tag[0] === "amount")?.[2];
    if (invoice) {
      await window.webln.sendPayment(invoice);
    }
  };
  const showDiffs = async () => {
    const dffs = await checkDiffs();

    if (dffs.json.length) {
      setDiffs(dffs.json);
    }
  };

  useEffect(() => {
    async function init() {
      if (typeof window.nostr === "undefined") {
        return;
      }
      const pubkey = await window.nostr.getPublicKey();
      console.log("pubkey from Alby: ", pubkey);
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

      ndk.pool.on("connect", async () => {
        console.log("connected to something", ndk.pool.stats());
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

        <div className="flex-col m8" css={{ padding: 8 }}>
          {relayStatus !== "Connected" ? <RelayUnReadyState /> : null}

          <div className="flex-col m8">
            <div className="flex-row m8">
              <Select options={["Code Review"]} css={{ flexGrow: 1 }} />
              <Button text="I'm Ready" onClick={showDiffs} />
            </div>
          </div>
        </div>

        {diffs.length > 0 ? (
          <Diffs diffs={diffs} onSubmit={handleSubmit} onRetry={showDiffs} />
        ) : null}

        {progress ? <Progress progress={progress} /> : null}

        {eventFeed.length > 0 && (
          <div
            css={{
              padding: 8,
            }}
          >
            {eventFeed
              .filter(({ status }) => status === progress)
              .map(({ event, status }, index) => {
                // Extract the necessary tag data
                const amountSats =
                  Number(
                    event.tags.find((tag) => tag[0] === "amount")?.[1] || 0,
                  ) / 1000;

                return (
                  <div
                    className="flex-row m8"
                    key={index}
                    css={{
                      background: tokens.backgroundHigher,
                      borderRadius: 8,
                      padding: 8,
                    }}
                  >
                    <div>
                      <Markdown markdown={event.content} />
                    </div>
                    {amountSats > 0 ? (
                      <Button
                        onClick={() => handleZap(event)}
                        text={`Zap ⚡ ${amountSats}`}
                      />
                    ) : null}
                  </div>
                );
              })}
          </div>
        )}
      </main>
    </>
  );
}

export default App;

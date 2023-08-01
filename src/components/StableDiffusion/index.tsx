import { DiffFile } from "diff2html/lib/types";
import { useState } from "react";
import Button from "../Button";
import { useAtom } from "jotai";
import { progressAtom, ProgressResult } from "../../state";
import Progress from "../Progress";
import NDK, { NDKEvent, NDKSubscription, NostrEvent } from "@nostr-dev-kit/ndk";
import { tokens } from "../../ui";
import { Markdown } from "../Markdown";
import { Check } from "react-feather";
import { handlePayment } from "../../lib/payments";
import { checkDiffs } from "../../lib/diff";
import Textarea from "../TextArea";

function EventItem({
  event,
  onPay,
  index,
  isPaid,
}: {
  event: NDKEvent;
  onPay: (event: NDKEvent, index: number) => void;
  isPaid: boolean;
  index: number;
}) {
  const amountSats =
    Number(event.tags.find((tag) => tag[0] === "amount")?.[1] || 0) / 1000;

  return (
    <div
      className="flex-row m8 p8"
      css={{
        background: tokens.backgroundHigher,
        borderRadius: 8,
      }}
    >
      <Markdown markdown={event.content} />
      {amountSats > 0 ? (
        <>
          {isPaid ? (
            <Check />
          ) : (
            <Button
              onClick={() => onPay(event, index)}
              text={`Zap ⚡ ${amountSats}`}
            />
          )}
        </>
      ) : null}
    </div>
  );
}

export default function StableDiffusion({ ndk }: { ndk: NDK }) {
  const [progress, setProgress] = useAtom(progressAtom);
  const [eventFeed, setEventFeed] = useState<
    Array<{
      status: ProgressResult;
      event: NDKEvent;
    }>
  >([]);
  const [paidEvents, setPaidEvents] = useState<Set<number>>(new Set());
  const [sub, setSub] = useState<NDKSubscription | null>(null);
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async () => {
    setEventFeed([]);
    setPaidEvents(new Set());
    setProgress(null);

    const event = new NDKEvent(ndk, {
      kind: 68006,
      tags: [["j", "image-gen"]],
      content: prompt,
    } as NostrEvent);

    await event.sign();

    if (sub) {
      sub.stop();
    }

    const codeReviewSub = ndk.subscribe(
      {
        ...event.filter(),
      },
      { closeOnEose: false, groupable: false },
    );

    codeReviewSub.on("event", (event: NDKEvent) => {
      setProgress((p) => {
        let progressType: ProgressResult = p;

        const status = event.tags.find((x) => x[0] === "status");

        if (status) {
          if (status[1] === "payment-required") {
            progressType = "started";
          } else {
            progressType = (status[1] || null) as ProgressResult;
          }
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

    setSub(codeReviewSub);

    await event.publish();
  };

  const handleZap = (event: NDKEvent, index: number) => {
    handlePayment({
      event,
      onComplete: () => {
        setPaidEvents(
          (currentPaidEvents) => new Set([...currentPaidEvents, index]),
        );
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };

  return (
    <div className="flex-col m8 p8">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter Prompt"
      />
      <Button text="Go" onClick={handleSubmit} />

      {progress ? <Progress progress={progress} /> : null}

      {eventFeed
        .filter(({ status }) => status === progress)
        .map(({ event }, index) => (
          <EventItem
            event={event}
            onPay={handleZap}
            index={index}
            key={index}
            isPaid={paidEvents.has(index)}
          />
        ))}
    </div>
  );
}

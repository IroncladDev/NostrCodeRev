import { DiffFile } from "diff2html/lib/types";
import { useState } from "react";
import Button from "../Button";
import { useAtom } from "jotai";
import { progressAtom, ProgressResult } from "../../state";
import Diffs from "./Diffs";
import Progress from "../Progress";
import NDK, { NDKEvent, NDKSubscription, NostrEvent } from "@nostr-dev-kit/ndk";
import { tokens } from "../../ui";
import { Markdown } from "../Markdown";
import { Check } from "react-feather";
import { handlePayment } from "../../lib/payments";
import { checkDiffs } from "../../lib/diff";

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

export default function CodeReview({ ndk }: { ndk: NDK }) {
  const [diffs, setDiffs] = useState<Array<DiffFile>>([]);
  const [progress, setProgress] = useAtom(progressAtom);
  const [eventFeed, setEventFeed] = useState<
    Array<{
      status: ProgressResult;
      event: NDKEvent;
    }>
  >([]);
  const [paidEvents, setPaidEvents] = useState<Set<number>>(new Set());
  const [sub, setSub] = useState<NDKSubscription | null>(null);

  const showDiffs = () => {
    checkDiffs().then((diffs) => setDiffs(diffs.json));
  };

  const handleSubmit = async () => {
    const { output } = await checkDiffs();

    setProgress(null);
    setPaidEvents(new Set());
    setDiffs([]);
    setEventFeed([]);

    const event = new NDKEvent(ndk, {
      kind: 68005,
      tags: [["j", "code-review"]],
      content: `Here is the git diff of my code.  Please provide me with a code review:\n\n${output}`,
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
      <Button text="I'm Ready" onClick={showDiffs} />

      {diffs.length > 0 ? (
        <Diffs diffs={diffs} onSubmit={handleSubmit} onRetry={showDiffs} />
      ) : null}

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

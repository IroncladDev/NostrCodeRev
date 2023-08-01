import { NDKEvent } from "@nostr-dev-kit/ndk";

export const handlePayment = async ({
  event,
  onComplete,
  onError,
}: {
  event: NDKEvent;
  onComplete: () => void;
  onError: (err: string) => void;
}) => {
  if (typeof window.webln === "undefined") {
    alert(
      "You need to use a webln enabled browser or extension to zap for these jobs! Download Alby at https://getalby.com !",
    );
    return;
  }

  await window.webln.enable();
  const invoice = event.tags.find((tag) => tag[0] === "amount")?.[2];
  if (invoice) {
    const { preimage } = await window.webln.sendPayment(invoice);
    if (preimage) {
      onComplete();
    } else {
      onError("No Preimage");
    }
  } else {
    onError("No Invoice");
  }
};

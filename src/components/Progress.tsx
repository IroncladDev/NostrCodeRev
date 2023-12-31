import { Check, Circle, X } from "react-feather";
import { ProgressResult } from "../state";
import { tokens } from "../ui";
import Loader from "./Loader";

export const progressValue = {
  received: 1,
  started: 2,
  success: 3,
  failed: 4,
};

// An individual pill
function ProgressPill({
  text,
  value,
  progress,
}: {
  text: string;
  value: number;
  progress: number;
}) {
  return (
    <div
      className="flex-row m8"
      css={{
        padding: "4px 8px",
        borderRadius: 36,
        background:
          progress < value
            ? tokens.backgroundHighest
            : progress === value
            ? tokens.accentPrimaryDimmer
            : tokens.accentPositiveDimmer,
        alignItems: "center",
      }}
    >
      <span css={{ fontSize: 12 }}>{text}</span>
      {progress < value ? <Circle size={16} /> : null}
      {progress === value ? <Loader size={16} /> : null}
      {progress > value ? <Check size={16} /> : null}
    </div>
  );
}

// A bordered spacer between pills
const Spacer = () => (
  <div
    css={{ flexGrow: 1, borderBottom: `solid 2px ${tokens.backgroundHighest}` }}
  />
);

// The request progress
export default function Progress({ progress }: { progress: ProgressResult }) {
  const val = progress ? progressValue[progress] : 0;

  return val === 4 ? (
    <div className="flex-row" css={{ justifyContent: "center" }}>
      <div
        className="flex-row m8"
        css={{
          padding: "4px 8px",
          borderRadius: 36,
          background: tokens.accentNegativeDimmer,
          alignItems: "center",
        }}
      >
        <span css={{ fontSize: 12 }}>Failed</span>
        <X />
      </div>
    </div>
  ) : (
    <div className="flex-row m8 p8" css={{ alignItems: "center" }}>
      <ProgressPill text="Receive" value={0} progress={val} />
      <Spacer />
      <ProgressPill text="Evaluate" value={1} progress={val} />
      <Spacer />
      <ProgressPill text="Complete" value={2} progress={val} />
    </div>
  );
}

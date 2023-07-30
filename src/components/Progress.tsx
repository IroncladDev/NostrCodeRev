import { Check, Circle } from "react-feather";
import { ProgressResult } from "../state";
import { tokens } from "../ui";
import Loader from "./Loader";

export const progressValue = {
  received: 1,
  started: 2,
  success: 3,
};

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

const Spacer = () => (
  <div
    css={{ flexGrow: 1, borderBottom: `solid 2px ${tokens.backgroundHighest}` }}
  />
);

export default function Progress({ progress }: { progress: ProgressResult }) {
  const val = progress ? progressValue[progress] : 0;

  return (
    <div className="flex-row m8 p8" css={{ alignItems: "center" }}>
      <ProgressPill text="Receive" value={0} progress={val} />
      <Spacer />
      <ProgressPill text="Evaluate" value={1} progress={val} />
      <Spacer />
      <ProgressPill text="Complete" value={2} progress={val} />
    </div>
  );
}

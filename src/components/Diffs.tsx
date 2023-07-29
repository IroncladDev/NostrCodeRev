import { DiffFile } from "diff2html/lib/types";
import { useState } from "react";
import { ChevronDown, ChevronRight, RefreshCw } from "react-feather";
import { tokens } from "../ui";
import Button from "./Button";

function Line({
  type,
  content,
  newNumber,
  oldNumber,
}: {
  type: "context" | "delete" | "insert";
  content: string;
  newNumber?: number;
  oldNumber?: number;
}) {
  let bg = "transparent";
  let fg = tokens.foregroundDefault;

  if (type === "delete") {
    bg = tokens.accentNegativeDimmest;
    fg = tokens.accentNegativeStrongest;
  } else if (type === "insert") {
    bg = tokens.accentPositiveDimmest;
    fg = tokens.accentPositiveStrongest;
  }

  return (
    <div
      className="flex-row m12"
      css={{ fontSize: 12, background: bg, paddingLeft: 8 }}
    >
      <code
        className="flex-row"
        css={{
          userSelect: "none",
          MozUserSelect: "none",
          MsUserSelect: "none",
          WebkitUserSelect: "none",
          marginRight: 8,
        }}
      >
        <span
          css={{
            width: String(newNumber || oldNumber).length * 8,
            display: "inline-block",
          }}
        >
          {newNumber || oldNumber}
        </span>
        <span
          css={{
            marginLeft: 8,
            width: 8,
            display: "inline-block",
          }}
        >
          {type === "insert" ? "+" : ""}
          {type === "delete" ? "-" : ""}
          {type === "context" ? " " : ""}
        </span>
      </code>
      <pre css={{ color: fg, wordWrap: "break-word", whiteSpace: "pre-wrap" }}>
        {type === "context" ? content : content.slice(1)}
      </pre>
    </div>
  );
}

function Diff(props: DiffFile & { isLast: boolean }) {
  const [collapsed, setIsCollapsed] = useState(true);

  return (
    <div
      className="flex-col"
      css={{
        background: tokens.backgroundHigher,
        borderBottom: props.isLast
          ? "none"
          : `1px solid ${tokens.backgroundHighest}`,
      }}
    >
      <button
        onClick={() => setIsCollapsed(!collapsed)}
        css={{
          "&:hover": {
            background: tokens.backgroundHighest,
          },
          transition: "0.25s",
          borderRadius: 0,
        }}
      >
        <div
          className="flex-row m8"
          css={{
            padding: "4px 8px",
            borderBottom: collapsed
              ? "none"
              : "solid 1px " + tokens.backgroundHighest,
          }}
        >
          <span css={{ fontSize: 12 }}>{props.newName}</span>

          <div css={{ flexGrow: 1 }} />

          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {collapsed ? null : (
        <div
          className="flex-col"
          css={{
            background: tokens.backgroundHigher,
          }}
        >
          {props.blocks
            .map((block) => block.lines)
            .flat(1)
            .map((l) => (
              <Line
                type={l.type}
                content={l.content}
                newNumber={l.newNumber}
                oldNumber={l.oldNumber}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default function Diffs({
  diffs,
  onSubmit,
  onRetry,
}: {
  diffs: Array<DiffFile>;
  onSubmit: () => void;
  onRetry: () => void;
}) {
  return (
    <div css={{ padding: 8 }} className="flex-col m8">
      <span css={{ fontSize: 14 }}>Changed Files</span>

      <div className="flex-col" css={{ borderRadius: 8, overflow: "hidden" }}>
        {diffs.map((diff, i) => (
          <Diff {...diff} key={i} isLast={i === diffs.length - 1} />
        ))}
      </div>

      <div className="flex-row m8">
        <div css={{ flexGrow: 1 }} />
        <Button text="Retry" onClick={onRetry} isDefault />
        <Button text="Go" onClick={onSubmit} />
      </div>
    </div>
  );
}

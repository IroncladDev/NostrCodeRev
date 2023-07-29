import { ButtonHTMLAttributes } from "react";
import { tokens } from "../ui";

export default function Button({
  text,
  isDefault,
  ...props
}: {
  text: string;
  isDefault?: boolean;
  children?: never;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      css={{
        background: isDefault ? tokens.backgroundHigher : tokens.accentPrimaryDimmer,
        color: tokens.foregroundDefault,
        padding: "4px 8px",
        borderRadius: 8,
        fontSize: 14,
        border: `solid 1px ${isDefault ? tokens.backgroundHigher : tokens.accentPrimaryDimmer}`,
        transition: "0.25s",
        "&:hover:not(:disabled)": {
          background: isDefault ? tokens.backgroundHighest : tokens.accentPrimaryDefault,
        },
        "&:active": {
          borderColor: tokens.accentPrimaryStrongest,
        },
        "&:disabled": {
          opacity: 0.5,
          cursor: "not-allowed",
        },
      }}
    >
      {text}
    </button>
  );
}

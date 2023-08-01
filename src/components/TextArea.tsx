import { InputHTMLAttributes } from "react";
import { tokens } from "../ui";

export default function Textarea({
  ...props
}: InputHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      css={{
        background: tokens.backgroundHigher,
        border: `1px solid ${tokens.backgroundHighest}`,
        borderRadius: 8,
        outline: "none",
        "&:focus": {
          border: `1px solid ${tokens.accentPrimaryDefault}`,
        },
        padding: 8,
        fontSize: 14,
        color: tokens.foregroundDefault,
        fontFamily: "inherit",
      }}
    />
  );
}

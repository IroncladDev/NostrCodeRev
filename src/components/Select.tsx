import { SelectHTMLAttributes } from "react";
import { tokens } from "../ui";

// A styled <select> element
export default function Select({
  options,
  ...props
}: {
  options: Array<[string, string]>;
  children?: never;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      css={{
        background: tokens.backgroundHigher,
        color: tokens.foregroundDefault,
        padding: "4px 8px",
        borderRadius: 8,
        fontSize: 14,
        outline: "none",
        border: `solid 1px ${tokens.backgroundHigher}`,
        transition: "0.25s",
        "&:hover": {
          background: tokens.backgroundHighest,
        },
        "&:active": {
          borderColor: tokens.foregroundDimmest,
        },
      }}
    >
      {options.map(([label, value], index) => (
        <option key={index} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

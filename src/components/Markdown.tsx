import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { useMemo } from "react";

const clean = (dirty: string) =>
  sanitizeHtml(dirty, {
    allowedTags: [
      "i",
      "em",
      "strong",
      "a",
      "p",
      "code",
      "br",
      "s",
      "strike",
      "br",
      "ul",
      "ol",
      "li",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedIframeHostnames: [],
  });

export const Markdown = ({ markdown }: {
  markdown: string;
}) => {
  const renderedMarkdown = useMemo(
    () => clean(DOMPurify.sanitize(marked.parse(markdown))),
    [markdown]
  );

  return (
    <span
      className="markdown"
      dangerouslySetInnerHTML={{
        __html: renderedMarkdown,
      }}
    />
  );
};

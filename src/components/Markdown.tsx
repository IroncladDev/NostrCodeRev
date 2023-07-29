import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { useMemo } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(lang, code).value;
    } else {
      return code;
    }
  }
});

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
      "pre",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6"
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedIframeHostnames: [],
  });

export const Markdown = ({ markdown }: { markdown: string }) => {
  const renderedMarkdown = useMemo(
    () => clean(DOMPurify.sanitize(marked.parse(markdown))),
    [markdown],
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
